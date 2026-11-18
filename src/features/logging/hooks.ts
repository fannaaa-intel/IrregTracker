import * as Haptics from 'expo-haptics';
import { useState } from 'react';

import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { periodDayRepo, type PeriodDay } from '../../db/repositories/period-day-repo';
import { addMonths, monthOf, type LocalDate, type Month } from '../../lib/date';
import type { Flow } from '../../theme';
import { buildMonthGrid, predictedWindow } from './logic';

/** How far ahead the calendar can page, so she can see the likely window. */
const MONTHS_AHEAD = 2;

/** Every logged period day, kept up to date after each write. */
export function usePeriodDays(): PeriodDay[] | undefined {
  return useLiveQuery((db) => periodDayRepo.listAll(db));
}

/** The flow logged on `date`: null if none, undefined while loading. */
export function useDayFlow(date: LocalDate): Flow | null | undefined {
  const days = usePeriodDays();
  if (days === undefined) return undefined;
  return days.find((day) => day.date === date)?.flow ?? null;
}

// DESIGN.md §6: a light haptic on logging a day, and nowhere else.
function confirmLogged(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function useLogging() {
  const db = useDb();
  return {
    async setFlow(date: LocalDate, flow: Flow): Promise<void> {
      await periodDayRepo.upsert(db, { date, flow });
      notifyDbChange();
      confirmLogged();
    },
    async clearDay(date: LocalDate): Promise<void> {
      await periodDayRepo.delete(db, date);
      notifyDbChange();
    },
    async setFlowForDays(dates: readonly LocalDate[], flow: Flow): Promise<void> {
      if (dates.length === 0) return;
      await periodDayRepo.upsertMany(
        db,
        dates.map((date) => ({ date, flow })),
      );
      notifyDbChange();
      confirmLogged();
    },
  };
}

const monthIndex = ({ year, month }: Month) => year * 12 + month;

/** Month paging, the predicted band, and backfill (multi-select) state for the calendar. */
export function useCalendar(today: LocalDate) {
  const days = usePeriodDays() ?? [];
  const { setFlowForDays } = useLogging();
  const [month, setMonth] = useState<Month>(() => monthOf(today));
  const [mode, setMode] = useState<'view' | 'backfill'>('view');
  const [selected, setSelected] = useState<ReadonlySet<LocalDate>>(() => new Set());
  const [backfillFlow, setBackfillFlow] = useState<Flow>('medium');

  const flows = new Map(days.map((day) => [day.date, day.flow]));
  // Cycle tags (M4) will be passed here once they can be created.
  const window = predictedWindow(days, [], today);
  const grid = buildMonthGrid(month, { flows, window, today, selected });
  const canGoNext = monthIndex(month) < monthIndex(monthOf(today)) + MONTHS_AHEAD;

  const exitBackfill = () => {
    setSelected(new Set());
    setMode('view');
  };

  return {
    grid,
    mode,
    canGoNext,
    selectedCount: selected.size,
    backfillFlow,
    setBackfillFlow,
    goPrev: () => setMonth((current) => addMonths(current, -1)),
    goNext: () => setMonth((current) => addMonths(current, 1)),
    startBackfill: () => {
      setSelected(new Set());
      setMode('backfill');
    },
    cancelBackfill: exitBackfill,
    toggleSelected: (date: LocalDate) =>
      setSelected((current) => {
        const next = new Set(current);
        if (next.has(date)) next.delete(date);
        else next.add(date);
        return next;
      }),
    saveBackfill: async () => {
      await setFlowForDays([...selected].sort(), backfillFlow);
      exitBackfill();
    },
  };
}
