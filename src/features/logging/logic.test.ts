import { addDays, diffDays } from '../../lib/date';
import type { Flow } from '../../theme';
import { onlyTwoCycles, regular } from '../__fixtures__/histories';
import {
  buildMonthGrid,
  dayLabel,
  predictedWindow,
  weekdayInitials,
  windowSegments,
  type DayCell,
} from './logic';

const MARCH_2026 = { year: 2026, month: 3 }; // starts on a Sunday, 31 days
const APRIL_2026 = { year: 2026, month: 4 }; // starts on a Wednesday, 30 days

const noData = { flows: new Map<string, Flow>(), window: null, today: '2026-03-18' };

function cellsOf(grid: ReturnType<typeof buildMonthGrid>): DayCell[] {
  return grid.weeks.flat().filter((cell): cell is DayCell => cell !== null);
}

describe('buildMonthGrid', () => {
  it('lays a month out in Sunday-first weeks with blanks around it', () => {
    const march = buildMonthGrid(MARCH_2026, noData);
    expect(march.weeks).toHaveLength(5);
    expect(march.weeks[0][0]?.date).toBe('2026-03-01');

    const april = buildMonthGrid(APRIL_2026, noData);
    expect(april.weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(april.weeks[0][3]?.date).toBe('2026-04-01');
    expect(april.weeks.every((week) => week.length === 7)).toBe(true);
    expect(cellsOf(april)).toHaveLength(30);
  });

  it('marks logged flows, today, and future days', () => {
    const flows = new Map<string, Flow>([
      ['2026-03-03', 'medium'],
      ['2026-03-04', 'spotting'],
    ]);
    const cells = cellsOf(buildMonthGrid(MARCH_2026, { ...noData, flows }));
    expect(cells[2]).toMatchObject({ date: '2026-03-03', flow: 'medium', dayOfMonth: 3 });
    expect(cells[3].flow).toBe('spotting');
    expect(cells[17]).toMatchObject({ date: '2026-03-18', isToday: true, isFuture: false });
    expect(cells[18].isFuture).toBe(true);
  });

  it('puts unlogged days inside the window into the band, inclusively', () => {
    const flows = new Map<string, Flow>([['2026-03-21', 'light']]);
    const window = { start: '2026-03-20', end: '2026-03-23' };
    const inWindow = cellsOf(buildMonthGrid(MARCH_2026, { ...noData, flows, window }))
      .filter((cell) => cell.inWindow)
      .map((cell) => cell.date);
    expect(inWindow).toEqual(['2026-03-20', '2026-03-22', '2026-03-23']);
  });

  it('marks selected days in backfill mode', () => {
    const selected = new Set(['2026-03-05']);
    const cells = cellsOf(buildMonthGrid(MARCH_2026, { ...noData, selected }));
    expect(cells.filter((cell) => cell.selected).map((cell) => cell.date)).toEqual(['2026-03-05']);
  });
});

describe('windowSegments', () => {
  it('joins consecutive window days in a week and splits around logged days', () => {
    const flows = new Map<string, Flow>([['2026-03-11', 'light']]);
    const window = { start: '2026-03-09', end: '2026-03-13' }; // Mon–Fri of week 2
    const week = buildMonthGrid(MARCH_2026, { ...noData, flows, window }).weeks[1];
    expect(windowSegments(week)).toEqual([
      { from: 1, to: 2 },
      { from: 4, to: 5 },
    ]);
  });

  it('is empty without a window', () => {
    expect(windowSegments(buildMonthGrid(MARCH_2026, noData).weeks[0])).toEqual([]);
  });
});

describe('dayLabel', () => {
  const base: DayCell = {
    date: '2026-03-03',
    dayOfMonth: 3,
    flow: null,
    isToday: false,
    isFuture: false,
    inWindow: false,
    selected: false,
  };

  it.each([
    [{ flow: 'medium' as Flow }, 'March 3, period day, medium flow'],
    [{ flow: 'spotting' as Flow }, 'March 3, spotting'],
    [{ isToday: true }, 'March 3, today, nothing logged'],
    [{ inWindow: true }, 'March 3, in the likely period window'],
    [{ flow: 'heavy' as Flow, selected: true }, 'March 3, period day, heavy flow, selected'],
  ])('describes %o', (change, label) => {
    expect(dayLabel({ ...base, ...change }, 'en-US')).toBe(label);
  });
});

describe('predictedWindow', () => {
  it('is the prediction window once there is enough history', () => {
    const window = predictedWindow(regular.days, [], regular.lastStart);
    expect(window && diffDays(window.start, regular.lastStart)).toBe(26);
    expect(window?.end).toBe(addDays(regular.lastStart, 30));
  });

  it('is null while still learning', () => {
    expect(predictedWindow(onlyTwoCycles.days, [], onlyTwoCycles.lastStart)).toBeNull();
  });
});

describe('weekdayInitials', () => {
  it('starts on Sunday', () => {
    expect(weekdayInitials('en-US')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });
});
