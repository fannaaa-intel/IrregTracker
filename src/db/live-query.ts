import { useEffect, useRef, useState } from 'react';

import { useDb } from './DatabaseProvider';
import type { Db } from './types';

// A tiny "live query": hooks re-run their query whenever a write calls notifyDbChange().
// Writes go through feature hooks, which call this after the repository resolves.
type Listener = () => void;
const listeners = new Set<Listener>();

export function notifyDbChange(): void {
  for (const listener of [...listeners]) listener();
}

export function subscribeDbChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Runs `query` now and after every DB change. Returns undefined until the first result.
 * The query is re-read on each change, so it should not depend on changing arguments.
 */
export function useLiveQuery<T>(query: (db: Db) => Promise<T>): T | undefined {
  const db = useDb();
  const [result, setResult] = useState<T>();
  const [version, setVersion] = useState(0);
  const queryRef = useRef(query);

  useEffect(() => {
    queryRef.current = query;
  });

  useEffect(() => subscribeDbChange(() => setVersion((v) => v + 1)), []);

  useEffect(() => {
    let active = true;
    queryRef.current(db).then(
      (value) => {
        if (active) setResult(value);
      },
      () => {
        // Never log the data itself (CLAUDE.md §1.3).
        console.warn('Live query failed.');
      },
    );
    return () => {
      active = false;
    };
  }, [db, version]);

  return result;
}
