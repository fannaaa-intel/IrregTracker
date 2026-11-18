import { BackupError, decryptBackup, encryptBackup } from './crypto';

// Fewer iterations keep the tests fast; the file records the count, so decrypt follows it.
const FAST = 1000;
// Tests only: the app passes expo-crypto's secure getRandomBytes.
const random = (n: number) => Uint8Array.from({ length: n }, () => Math.floor(Math.random() * 256));
const kindOf = async (p: Promise<unknown>) => {
  try {
    await p;
    return 'ok';
  } catch (error) {
    return error instanceof BackupError ? error.kind : 'other';
  }
};

describe('backup encryption', () => {
  const plain = JSON.stringify({ hello: 'made-up data', n: [1, 2, 3] });

  it('round-trips with the right passphrase and never stores the plaintext', async () => {
    const file = await encryptBackup(plain, 'correct horse', random, FAST);
    expect(file).not.toContain('made-up data');
    expect(file).not.toContain('correct horse');
    expect(JSON.parse(file)).toMatchObject({
      format: 'cycle-tracker-backup',
      version: 1,
      kdf: { name: 'PBKDF2-SHA256', iterations: FAST },
      cipher: { name: 'AES-256-GCM' },
    });
    expect(await decryptBackup(file, 'correct horse')).toBe(plain);
  });

  it('uses a fresh salt and nonce every time', async () => {
    const a = JSON.parse(await encryptBackup(plain, 'correct horse', random, FAST));
    const b = JSON.parse(await encryptBackup(plain, 'correct horse', random, FAST));
    expect(a.kdf.salt).not.toBe(b.kdf.salt);
    expect(a.cipher.nonce).not.toBe(b.cipher.nonce);
    expect(a.data).not.toBe(b.data);
  });

  it('rejects a wrong passphrase', async () => {
    const file = await encryptBackup(plain, 'correct horse', random, FAST);
    expect(await kindOf(decryptBackup(file, 'wrong horse'))).toBe('wrong-passphrase');
  });

  it('detects tampering with the data or the header', async () => {
    const file = JSON.parse(await encryptBackup(plain, 'correct horse', random, FAST));
    const flipped = { ...file, data: (file.data[0] === 'a' ? 'b' : 'a') + file.data.slice(1) };
    expect(await kindOf(decryptBackup(JSON.stringify(flipped), 'correct horse'))).toBe(
      'wrong-passphrase',
    );
    const weaker = { ...file, kdf: { ...file.kdf, iterations: FAST + 1 } };
    expect(await kindOf(decryptBackup(JSON.stringify(weaker), 'correct horse'))).toBe(
      'wrong-passphrase',
    );
  });

  it('recognises files that are not backups, or from a newer app', async () => {
    expect(await kindOf(decryptBackup('not json', 'x'))).toBe('not-a-backup');
    expect(await kindOf(decryptBackup('{"format":"other"}', 'x'))).toBe('not-a-backup');
    const file = JSON.parse(await encryptBackup(plain, 'correct horse', random, FAST));
    expect(await kindOf(decryptBackup(JSON.stringify({ ...file, version: 2 }), 'x'))).toBe(
      'newer-version',
    );
  });
});
