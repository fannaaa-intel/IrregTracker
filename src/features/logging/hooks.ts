import * as Haptics from 'expo-haptics';
import { useState } from 'react';

import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange } from '../../db/live-query';
import { periodDayRepo } from '../../db/repositories/period-day-repo';
import { addMonths, monthOf, type LocalDate, type Month } from '../../lib/date';
import type { Flow } from '../../theme';
import { useCycleOverview, useFertileDaysOn, usePeriodDays } from '../cycles/hooks';
import { useIntimacyEntries } from '../intimacy/hooks';
import { summarizeMonth } from '../reports/logic';
import { useSymptomEntries } from '../symptoms/hooks';
import { applyLayers, CALENDAR_LAYERS, toggleLayer, type CalendarLayer } from './filters';
import { buildMonthGrid } from './logic';

/** How far ahead the calendar can page, so she can see the likely window. */
const MONTHS_AHEAD = 2;

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
  const overview = useCycleOverview(today);
  const { setFlowForDays } = useLogging();
  const [month, setMonth] = useState<Month>(() => monthOf(today));
  const [mode, setMode] = useState<'view' | 'backfill'>('view');
  const [selected, setSelected] = useState<ReadonlySet<LocalDate>>(() => new Set());
  const [backfillFlow, setBackfillFlow] = useState<Flow>('medium');
  const [visible, setVisible] = useState<ReadonlySet<CalendarLayer>>(
    () => new Set(CALENDAR_LAYERS),
  );

  const flows = new Map(days.map((day) => [day.date, day.flow]));
  // Same prediction as Home: respects tags and confirmed short cycles.
  const prediction = overview?.prediction;
  const window = prediction?.state === 'window' ? prediction.window : null;
  // Only when there is an estimate to show (on in Settings, regular enough, not late).
  const showFertile = useFertileDaysOn() === true && overview?.fertile != null;
  const intimacyEntries = useIntimacyEntries() ?? [];
  const symptomEntries = useSymptomEntries() ?? [];
  const layers = applyLayers(
    {
      flows,
      window,
      fertile: showFertile ? (overview?.fertile ?? null) : null,
      intimacy: new Set(intimacyEntries.map((e) => e.date)),
      symptoms: new Set(symptomEntries.map((e) => e.date)),
    },
    visible,
  );
  const grid = buildMonthGrid(month, { ...layers, today, selected });
  // The monthly report always counts everything, whatever the filters show.
  const report =
    overview === undefined
      ? null
      : summarizeMonth(month, {
          days,
          history: overview.history,
          symptoms: symptomEntries,
          intimacy: intimacyEntries,
        });
  const canGoNext = monthIndex(month) < monthIndex(monthOf(today)) + MONTHS_AHEAD;

  const exitBackfill = () => {
    setSelected(new Set());
    setMode('view');
  };

  return {
    grid,
    monthKey: monthIndex(month),
    report,
    showFertile,
    visible,
    toggleLayer: (layer: CalendarLayer) => setVisible((current) => toggleLayer(current, layer)),
    mode,
    canGoNext,
    selectedCount: selected.size,
    backfillFlow,
    setBackfillFlow,
    isCurrentMonth: monthIndex(month) === monthIndex(monthOf(today)),
    goToday: () => setMonth(monthOf(today)),
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
