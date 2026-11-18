import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { DbOpenError } from './errors';

// The key lives only in SecureStore (CLAUDE.md §1.4). Callers use it once to unlock the
// database and must not keep it in state, storage, files, or logs.
const KEY_NAME = 'db_key_v1';
const KEY_BYTES = 32;
const HEX_KEY = /^[0-9a-f]{64}$/;

export const keyStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Deletes the key (Delete all data). A new one is created on the next launch. */
export async function deleteDbKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_NAME, keyStoreOptions);
}

/** Returns the 32-byte database key as 64 lowercase hex chars, creating it on first launch. */
export async function getOrCreateDbKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY_NAME, keyStoreOptions);
  if (existing !== null) {
    if (!HEX_KEY.test(existing)) {
      throw new DbOpenError('key', 'Stored database key is malformed.');
    }
    return existing;
  }

  const key = toHex(getRandomBytes(KEY_BYTES));
  await SecureStore.setItemAsync(KEY_NAME, key, keyStoreOptions);
  return key;
}
