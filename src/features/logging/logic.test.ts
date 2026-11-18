import type { Flow } from '../../theme';
import {
  buildMonthGrid,
  dayContext,
  dayLabel,
  fertileSegments,
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

describe('fertile days on the grid', () => {
  const fertile = {
    fertile: { start: '2026-03-08', end: '2026-03-14' },
    ovulation: { start: '2026-03-10', end: '2026-03-12' },
  };

  it('marks fertile and ovulation days, both ends inclusive', () => {
    const cells = cellsOf(buildMonthGrid(MARCH_2026, { ...noData, fertile }));
    const kind = (day: number) => cells[day - 1].fertility;
    expect([7, 8, 9, 10, 12, 13, 14, 15].map(kind)).toEqual([
      null,
      'fertile',
      'fertile',
      'ovulation',
      'ovulation',
      'fertile',
      'fertile',
      null,
    ]);
  });

  it('joins fertile and ovulation days into one band per week', () => {
    const week = buildMonthGrid(MARCH_2026, { ...noData, fertile }).weeks[1]; // Mar 8–14
    expect(fertileSegments(week)).toEqual([{ from: 0, to: 6 }]);
    expect(fertileSegments(buildMonthGrid(MARCH_2026, noData).weeks[1])).toEqual([]);
  });

  it('marks days with sex or symptoms logged', () => {
    const cells = cellsOf(
      buildMonthGrid(MARCH_2026, {
        ...noData,
        intimacy: new Set(['2026-03-05']),
        symptoms: new Set(['2026-03-06']),
      }),
    );
    expect(cells[4]).toMatchObject({ hasIntimacy: true, hasSymptoms: false });
    expect(cells[5]).toMatchObject({ hasIntimacy: false, hasSymptoms: true });
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
    [{ fertility: 'fertile' as const }, 'March 3, possible fertile day'],
    [
      { fertility: 'ovulation' as const, isToday: true },
      'March 3, today, possible fertile day, likely ovulation',
    ],
    [{ hasIntimacy: true }, 'March 3, sex logged'],
    [
      { flow: 'light' as Flow, hasSymptoms: true, hasIntimacy: true },
      'March 3, period day, light flow, symptoms logged, sex logged',
    ],
  ])('describes %o', (change, label) => {
    expect(dayLabel({ ...base, ...change }, 'en-US')).toBe(label);
  });
});

describe('weekdayInitials', () => {
  it('starts on Sunday', () => {
    expect(weekdayInitials('en-US')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });
});

describe('dayContext', () => {
  const window = { start: '2026-03-28', end: '2026-03-31' };
  const fertile = {
    fertile: { start: '2026-03-08', end: '2026-03-14' },
    ovulation: { start: '2026-03-10', end: '2026-03-12' },
  };

  it('says nothing about ordinary days', () => {
    expect(dayContext('2026-03-20', { window, fertile })).toEqual([]);
    expect(dayContext('2026-03-10', { window: null, fertile: null })).toEqual([]);
  });

  it('explains each estimate, both ends inclusive, and always says it is an estimate', () => {
    expect(dayContext('2026-03-08', { window, fertile })[0]).toMatch(/^Possible fertile day/);
    expect(dayContext('2026-03-10', { window, fertile })[0]).toMatch(/^Likely ovulation/);
    expect(dayContext('2026-03-12', { window, fertile })[0]).toMatch(/^Likely ovulation/);
    expect(dayContext('2026-03-14', { window, fertile })[0]).toMatch(/^Possible fertile day/);
    expect(dayContext('2026-03-31', { window, fertile })[0]).toMatch(/^Your next period/);
    for (const date of ['2026-03-08', '2026-03-10', '2026-03-28']) {
      expect(dayContext(date, { window, fertile }).join(' ')).toContain('An estimate');
    }
  });
});
