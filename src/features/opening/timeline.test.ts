import appJson from '../../../app.json';
import { openingTimeline, SPLASH_IMAGE_SIZE } from './timeline';

describe('openingTimeline', () => {
  const full = openingTimeline(false);

  it('keeps every animation at 250 ms or less (CLAUDE.md §6.7)', () => {
    for (const step of [full.ring, ...full.dots, full.exit]) {
      expect(step.duration).toBeGreaterThan(0);
      expect(step.duration).toBeLessThanOrEqual(250);
    }
  });

  it('shows four dots one after another, then fades out after the last one', () => {
    expect(full.dots).toHaveLength(4);
    full.dots.slice(1).forEach((dot, i) => expect(dot.delay).toBeGreaterThan(full.dots[i].delay));
    const last = full.dots[3];
    expect(full.exit.delay).toBeGreaterThanOrEqual(last.delay + last.duration);
    expect(full.total).toBe(full.hold + full.exit.delay + full.exit.duration);
  });

  it('stays short: under a second from splash to app', () => {
    expect(full.total).toBeLessThan(1000);
  });

  it('with Reduce motion: no ring or dots, just a quick fade', () => {
    const reduced = openingTimeline(true);
    expect(reduced.dots).toEqual([]);
    expect(reduced.ring.duration).toBe(0);
    expect(reduced.total).toBeLessThanOrEqual(150);
  });

  it('matches the native splash image size, so the hand-off does not jump', () => {
    const plugins: unknown[] = appJson.expo.plugins;
    const splash = plugins.find(
      (p): p is [string, { imageWidth: number }] =>
        Array.isArray(p) && p[0] === 'expo-splash-screen',
    );
    expect(splash?.[1].imageWidth).toBe(SPLASH_IMAGE_SIZE);
  });
});
