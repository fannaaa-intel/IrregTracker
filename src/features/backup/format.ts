// What goes inside a backup, and strict validation of what comes back (pure).
// The backup holds every row from the database, so import can fully replace it.
import { isLocalDate, type LocalDate } from '../../lib/date';
import { isProtection } from '../intimacy/logic';
import { isSymptom } from '../symptoms/logic';

export type BackupPeriodDay = {
  date: LocalDate;
  flow: string;
  createdAt: string;
  updatedAt: string;
};
export type BackupCycleTag = {
  cycleStart: LocalDate;
  reason: string;
  note: string | null;
  exclude: boolean;
};
export type BackupSetting = { key: string; value: string };
export type BackupSymptom = { date: LocalDate; type: string };
export type BackupIntimacy = { date: LocalDate; protection: string };

export type BackupData = {
  /** PRAGMA user_version of the database the backup came from. */
  schemaVersion: number;
  periodDays: BackupPeriodDay[];
  cycleTags: BackupCycleTag[];
  settings: BackupSetting[];
  /** Added in schema 2; backups from schema 1 have none. */
  symptoms: BackupSymptom[];
  intimacy: BackupIntimacy[];
};

export type BackupSummary = {
  days: number;
  firstDate: LocalDate | null;
  lastDate: LocalDate | null;
  tags: number;
};

const FLOWS = ['spotting', 'light', 'medium', 'heavy'];
const REASONS = ['illness', 'travel', 'stress', 'medication', 'other'];
/** Device-only settings that never travel in a backup (a restored phone may not support them). */
export const DEVICE_ONLY_SETTINGS = ['app_lock'];

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isString = (v: unknown): v is string => typeof v === 'string';

function validDay(v: unknown): v is BackupPeriodDay {
  return (
    isObject(v) &&
    isString(v.date) &&
    isLocalDate(v.date) &&
    isString(v.flow) &&
    FLOWS.includes(v.flow) &&
    isString(v.createdAt) &&
    isString(v.updatedAt)
  );
}

function validTag(v: unknown): v is BackupCycleTag {
  return (
    isObject(v) &&
    isString(v.cycleStart) &&
    isLocalDate(v.cycleStart) &&
    isString(v.reason) &&
    REASONS.includes(v.reason) &&
    (v.note === null || isString(v.note)) &&
    typeof v.exclude === 'boolean'
  );
}

function validSetting(v: unknown): v is BackupSetting {
  return isObject(v) && isString(v.key) && isString(v.value);
}

function validSymptom(v: unknown): v is BackupSymptom {
  return (
    isObject(v) && isString(v.date) && isLocalDate(v.date) && isString(v.type) && isSymptom(v.type)
  );
}

function validIntimacy(v: unknown): v is BackupIntimacy {
  return (
    isObject(v) &&
    isString(v.date) &&
    isLocalDate(v.date) &&
    isString(v.protection) &&
    isProtection(v.protection)
  );
}

/** A list added in a later schema: missing means none; present must be fully valid. */
function optionalList<T>(value: unknown, valid: (v: unknown) => v is T): T[] | null {
  if (value === undefined) return [];
  return Array.isArray(value) && value.every(valid) ? value : null;
}

/** The data, or null if anything is missing, malformed or duplicated. */
export function validateBackupData(value: unknown): BackupData | null {
  if (!isObject(value)) return null;
  const { schemaVersion, periodDays, cycleTags, settings } = value;
  const symptoms = optionalList(value.symptoms, validSymptom);
  const intimacy = optionalList(value.intimacy, validIntimacy);
  if (symptoms === null || intimacy === null) return null;
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
    return null;
  }
  if (!Array.isArray(periodDays) || !periodDays.every(validDay)) return null;
  if (!Array.isArray(cycleTags) || !cycleTags.every(validTag)) return null;
  if (!Array.isArray(settings) || !settings.every(validSetting)) return null;
  const unique = (keys: string[]) => new Set(keys).size === keys.length;
  if (!unique(periodDays.map((d) => d.date))) return null;
  if (!unique(cycleTags.map((t) => t.cycleStart))) return null;
  if (!unique(settings.map((s) => s.key))) return null;
  if (!unique(symptoms.map((s) => `${s.date}|${s.type}`))) return null;
  if (!unique(intimacy.map((d) => d.date))) return null;
  return {
    schemaVersion,
    periodDays,
    cycleTags,
    settings: settings.filter((s) => !DEVICE_ONLY_SETTINGS.includes(s.key)),
    symptoms,
    intimacy,
  };
}

/** What the import preview shows before anything is replaced. */
export function summarizeBackup(data: BackupData): BackupSummary {
  const dates = data.periodDays.map((d) => d.date).sort();
  return {
    days: dates.length,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    tags: data.cycleTags.length,
  };
}

export const MIN_PASSPHRASE = 8;

/** Why a new backup passphrase can't be used yet, or null when it's fine. */
export function passphraseProblem(passphrase: string, confirm: string): string | null {
  if (passphrase.length < MIN_PASSPHRASE) {
    return `Use at least ${MIN_PASSPHRASE} characters.`;
  }
  if (passphrase !== confirm) return "The two passphrases don't match yet.";
  return null;
}
