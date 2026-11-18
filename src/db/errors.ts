// Why the database could not be opened. Shown as a calm error screen; never as health data.
export type DbErrorKind =
  | 'not-encrypted' // SQLCipher is missing: we refuse to run unencrypted (CLAUDE.md §1.2)
  | 'key' // the key is missing, malformed, or doesn't open the existing file
  | 'schema' // the file was written by a newer app version
  | 'unknown';

export class DbOpenError extends Error {
  readonly kind: DbErrorKind;

  constructor(kind: DbErrorKind, message: string) {
    super(message);
    this.name = 'DbOpenError';
    this.kind = kind;
  }
}

export function getDbErrorKind(error: unknown): DbErrorKind {
  return error instanceof DbOpenError ? error.kind : 'unknown';
}
