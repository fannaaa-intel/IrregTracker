import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { DbOpenError } from './errors';
import { getOrCreateDbKey, keyStoreOptions } from './key-service';

jest.mock('expo-crypto', () => ({ getRandomBytes: jest.fn() }));
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const getItem = jest.mocked(SecureStore.getItemAsync);
const setItem = jest.mocked(SecureStore.setItemAsync);
const randomBytes = jest.mocked(getRandomBytes);

beforeEach(() => {
  jest.resetAllMocks();
});

describe('getOrCreateDbKey', () => {
  it('creates a 32-byte hex key on first launch and stores it device-only', async () => {
    getItem.mockResolvedValue(null);
    randomBytes.mockReturnValue(new Uint8Array(32).fill(0xab));

    const key = await getOrCreateDbKey();

    expect(randomBytes).toHaveBeenCalledWith(32);
    expect(key).toBe('ab'.repeat(32));
    expect(setItem).toHaveBeenCalledWith('db_key_v1', key, keyStoreOptions);
    expect(keyStoreOptions.keychainAccessible).toBe(SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY);
  });

  it('reuses the stored key and does not create a new one', async () => {
    const stored = '0f'.repeat(32);
    getItem.mockResolvedValue(stored);

    await expect(getOrCreateDbKey()).resolves.toBe(stored);
    expect(randomBytes).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('rejects a malformed stored key instead of overwriting it', async () => {
    getItem.mockResolvedValue('not-a-key');

    const result = getOrCreateDbKey();

    await expect(result).rejects.toBeInstanceOf(DbOpenError);
    await expect(result).rejects.toMatchObject({ kind: 'key' });
    expect(setItem).not.toHaveBeenCalled();
  });
});
