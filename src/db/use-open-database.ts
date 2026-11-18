import { useEffect, useState } from 'react';

import { getDb, type Db } from './client';
import { getDbErrorKind, type DbErrorKind } from './errors';

export type DbState =
  { status: 'opening' } | { status: 'ready'; db: Db } | { status: 'error'; kind: DbErrorKind };

/** Opens the encrypted database once for the app's lifetime. */
export function useOpenDatabase(): DbState {
  const [state, setState] = useState<DbState>({ status: 'opening' });

  useEffect(() => {
    let active = true;
    getDb().then(
      (db) => {
        if (active) setState({ status: 'ready', db });
      },
      (error: unknown) => {
        const kind = getDbErrorKind(error);
        // Log the error kind only: never data (CLAUDE.md §1.3).
        console.warn(`Database failed to open (${kind}).`);
        if (active) setState({ status: 'error', kind });
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return state;
}
