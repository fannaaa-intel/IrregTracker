import type { LocalDate } from '../../lib/date';
import { useDayIntimacy } from '../intimacy/hooks';
import { useDayFlow } from '../logging/hooks';
import { useDaySymptoms } from '../symptoms/hooks';
import type { TodayLog } from './logic';

/** Everything logged on `today`, or undefined while loading. */
export function useTodayLog(today: LocalDate): TodayLog | undefined {
  const flow = useDayFlow(today);
  const { symptoms } = useDaySymptoms(today);
  const { protection } = useDayIntimacy(today);
  if (flow === undefined || symptoms === undefined || protection === undefined) return undefined;
  return { flow, symptoms, protection };
}
