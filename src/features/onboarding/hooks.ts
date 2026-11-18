import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { periodDayRepo } from '../../db/repositories/period-day-repo';
import { settingRepo } from '../../db/repositories/setting-repo';
import { needsOnboarding } from './logic';

export type OnboardingState = 'loading' | 'needed' | 'done';

export function useOnboardingState(): OnboardingState {
  const done = useLiveQuery((db) => settingRepo.isOnboardingDone(db));
  const days = useLiveQuery((db) => periodDayRepo.listAll(db));
  if (done === undefined || days === undefined) return 'loading';
  return needsOnboarding(done, days.length) ? 'needed' : 'done';
}

export function useFinishOnboarding(): () => Promise<void> {
  const db = useDb();
  return async () => {
    await settingRepo.setOnboardingDone(db);
    notifyDbChange();
  };
}
