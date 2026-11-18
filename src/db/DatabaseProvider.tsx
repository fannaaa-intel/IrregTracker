import { createContext, useContext, type ReactNode } from 'react';

import type { Db } from './client';

const DbContext = createContext<Db | null>(null);

type Props = {
  db: Db;
  children: ReactNode;
};

export function DatabaseProvider({ db, children }: Props) {
  return <DbContext value={db}>{children}</DbContext>;
}

/** The open, verified-encrypted database. Pass it to repositories; never run SQL in components. */
export function useDb(): Db {
  const db = useContext(DbContext);
  if (db === null) {
    throw new Error('useDb() must be used inside <DatabaseProvider>.');
  }
  return db;
}
