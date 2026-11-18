import type { SQLiteDatabase } from 'expo-sqlite';

/** An opened, verified-encrypted database. Only `src/db/client.ts` creates one. */
export type Db = SQLiteDatabase;
