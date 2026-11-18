// Backup encryption (CLAUDE.md §1.5, PLAN.md §8): AES-256-GCM with a key derived from her
// passphrase by PBKDF2-SHA256. Pure: randomness is passed in. The passphrase is never stored.
import { gcm } from '@noble/ciphers/aes';
import { bytesToUtf8 } from '@noble/ciphers/utils';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

export const BACKUP_FORMAT = 'cycle-tracker-backup';
export const BACKUP_VERSION = 1;
export const KDF_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const NONCE_BYTES = 12;

export type BackupErrorKind = 'not-a-backup' | 'newer-version' | 'wrong-passphrase';

export class BackupError extends Error {
  readonly kind: BackupErrorKind;
  constructor(kind: BackupErrorKind) {
    super(kind);
    this.name = 'BackupError';
    this.kind = kind;
  }
}

type Envelope = {
  format: typeof BACKUP_FORMAT;
  version: number;
  kdf: { name: 'PBKDF2-SHA256'; iterations: number; salt: string };
  cipher: { name: 'AES-256-GCM'; nonce: string };
  data: string;
};

const deriveKey = (passphrase: string, salt: Uint8Array, iterations: number) =>
  pbkdf2Async(sha256, utf8ToBytes(passphrase.normalize('NFC')), salt, { c: iterations, dkLen: 32 });

/** The header is authenticated too, so nobody can quietly swap the KDF settings. */
const headerOf = (e: Omit<Envelope, 'data'>) =>
  utf8ToBytes(JSON.stringify([e.format, e.version, e.kdf, e.cipher]));

export async function encryptBackup(
  plaintext: string,
  passphrase: string,
  randomBytes: (length: number) => Uint8Array,
  iterations: number = KDF_ITERATIONS,
): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const nonce = randomBytes(NONCE_BYTES);
  const header: Omit<Envelope, 'data'> = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    kdf: { name: 'PBKDF2-SHA256', iterations, salt: bytesToHex(salt) },
    cipher: { name: 'AES-256-GCM', nonce: bytesToHex(nonce) },
  };
  const key = await deriveKey(passphrase, salt, iterations);
  const sealed = gcm(key, nonce, headerOf(header)).encrypt(utf8ToBytes(plaintext));
  key.fill(0);
  return JSON.stringify({ ...header, data: bytesToHex(sealed) } satisfies Envelope);
}

function parseEnvelope(fileText: string): Envelope {
  let value: unknown;
  try {
    value = JSON.parse(fileText);
  } catch {
    throw new BackupError('not-a-backup');
  }
  const e = value as Partial<Envelope> | null;
  if (e?.format !== BACKUP_FORMAT || typeof e.version !== 'number') {
    throw new BackupError('not-a-backup');
  }
  if (e.version > BACKUP_VERSION) throw new BackupError('newer-version');
  const ok =
    e.kdf?.name === 'PBKDF2-SHA256' &&
    Number.isInteger(e.kdf.iterations) &&
    e.kdf.iterations >= 1 &&
    e.kdf.iterations <= 10_000_000 &&
    typeof e.kdf.salt === 'string' &&
    e.cipher?.name === 'AES-256-GCM' &&
    typeof e.cipher.nonce === 'string' &&
    typeof e.data === 'string';
  if (!ok) throw new BackupError('not-a-backup');
  return e as Envelope;
}

/** The decrypted text. A wrong passphrase and a tampered file look the same (GCM fails). */
export async function decryptBackup(fileText: string, passphrase: string): Promise<string> {
  const e = parseEnvelope(fileText);
  let salt: Uint8Array, nonce: Uint8Array, data: Uint8Array;
  try {
    [salt, nonce, data] = [hexToBytes(e.kdf.salt), hexToBytes(e.cipher.nonce), hexToBytes(e.data)];
  } catch {
    throw new BackupError('not-a-backup');
  }
  const key = await deriveKey(passphrase, salt, e.kdf.iterations);
  try {
    const plain = gcm(key, nonce, headerOf(e)).decrypt(data);
    return bytesToUtf8(plain);
  } catch {
    throw new BackupError('wrong-passphrase');
  } finally {
    key.fill(0);
  }
}
