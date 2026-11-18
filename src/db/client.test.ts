import { openDatabaseAsync } from 'expo-sqlite';

import { getDb, openEncryptedDb } from './client';
import { getOrCreateDbKey } from './key-service';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('./key-service', () => ({ getOrCreateDbKey: jest.fn() }));

const KEY = 'ab'.repeat(32);

type FakeOptions = { cipherVersion?: string | null; keyOpensFile?: boolean };

// Records every statement so tests can check what ran, and in what order.
function createFakeDb({
  cipherVersion = '4.6.1 community',
  keyOpensFile = true,
}: FakeOptions = {}) {
  const calls: string[] = [];
  const db = {
    execAsync: jest.fn(async (sql: string) => {
      calls.push(sql.trim());
    }),
    getFirstAsync: jest.fn(async (sql: string) => {
      calls.push(sql);
      if (sql.startsWith('PRAGMA cipher_version')) {
        return cipherVersion === null ? null : { cipher_version: cipherVersion };
      }
      if (sql.includes('sqlite_master')) {
        if (!keyOpensFile) throw new Error('file is not a database');
        return { n: 0 };
      }
      if (sql.startsWith('PRAGMA user_version')) return { user_version: 0 };
      return null;
    }),
    // On a phone this opens a second connection without the key; it must never be used.
    withExclusiveTransactionAsync: jest.fn(async () => {
      throw new Error('unkeyed second connection');
    }),
    closeAsync: jest.fn(async () => undefined),
  };
  jest.mocked(openDatabaseAsync).mockResolvedValue(db as never);
  return { db, calls };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getOrCreateDbKey).mockResolvedValue(KEY);
});

describe('openEncryptedDb', () => {
  it('applies the key as the very first statement, then verifies and migrates', async () => {
    const { db, calls } = createFakeDb();

    await expect(openEncryptedDb()).resolves.toBe(db);

    expect(calls[0]).toBe(`PRAGMA key = "x'${KEY}'";`);
    expect(calls[1]).toBe('PRAGMA cipher_version;');
    expect(calls.some((sql) => sql.startsWith('CREATE TABLE period_day'))).toBe(true);
    // Migrations run on this same keyed connection (the v1.2.0 first-launch bug).
    expect(calls).toContain('BEGIN IMMEDIATE;');
    expect(calls).toContain('COMMIT;');
    expect(db.withExclusiveTransactionAsync).not.toHaveBeenCalled();
    expect(db.closeAsync).not.toHaveBeenCalled();
  });

  it.each([
    ['no row', null],
    ['an empty version', ''],
  ])('stops with not-encrypted when cipher_version returns %s', async (_label, version) => {
    const { db, calls } = createFakeDb({ cipherVersion: version });

    await expect(openEncryptedDb()).rejects.toMatchObject({ kind: 'not-encrypted' });

    // Nothing may run against an unencrypted file after the check fails.
    expect(calls).toEqual([`PRAGMA key = "x'${KEY}'";`, 'PRAGMA cipher_version;']);
    expect(db.withExclusiveTransactionAsync).not.toHaveBeenCalled();
    expect(db.closeAsync).toHaveBeenCalledTimes(1);
  });

  it('stops with a key error when the key does not open the file', async () => {
    const { db } = createFakeDb({ keyOpensFile: false });

    await expect(openEncryptedDb()).rejects.toMatchObject({ kind: 'key' });

    expect(db.withExclusiveTransactionAsync).not.toHaveBeenCalled();
    expect(db.closeAsync).toHaveBeenCalledTimes(1);
  });
});

describe('getDb', () => {
  it('retries after a failed open, then reuses the open connection', async () => {
    createFakeDb({ cipherVersion: null });
    await expect(getDb()).rejects.toMatchObject({ kind: 'not-encrypted' });

    const { db } = createFakeDb();
    await expect(getDb()).resolves.toBe(db);
    await expect(getDb()).resolves.toBe(db);

    expect(openDatabaseAsync).toHaveBeenCalledTimes(2);
  });
});
