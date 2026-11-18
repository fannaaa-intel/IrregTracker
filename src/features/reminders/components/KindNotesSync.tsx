import { useKindNotesSync } from '../hooks';

/** Mounted once in the root layout, inside the database provider. Renders nothing. */
export function KindNotesSync() {
  useKindNotesSync();
  return null;
}
