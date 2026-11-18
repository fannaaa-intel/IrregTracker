import { useCycleRemindersSync } from '../cycle-hooks';

/** Mounted once in the root layout, inside the database provider. Renders nothing. */
export function CycleRemindersSync() {
  useCycleRemindersSync();
  return null;
}
