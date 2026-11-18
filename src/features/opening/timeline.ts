// The opening animation's timing (pure, so DESIGN.md §6 limits are tested).
// Starts from the exact native splash frame (logo tile, 160 dp, centred), then:
//   ring   – a thin petal ring draws around the logo (the cycle-ring motif from Home)
//   dots   – four petal dots appear one by one under it (the divider motif)
//   exit   – everything fades out while the logo eases up very slightly
import { motion } from '../../theme';

export type Step = { delay: number; duration: number };

export type OpeningTimeline = {
  /** Hold the splash frame while the app's first render settles, so nothing stutters. */
  hold: number;
  ring: Step;
  dots: Step[];
  exit: Step;
  /** When the overlay is gone and can be removed. */
  total: number;
};

const DOT_COUNT = 4;
const DOT_STAGGER = 60;

export function openingTimeline(reduceMotion: boolean): OpeningTimeline {
  if (reduceMotion) {
    // No movement at all: just a short cross-fade from the splash to the app.
    const exit = { delay: 0, duration: motion.press };
    return { hold: 0, ring: { delay: 0, duration: 0 }, dots: [], exit, total: exit.duration };
  }
  const ring = { delay: 0, duration: motion.sheet };
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => ({
    delay: 150 + i * DOT_STAGGER,
    duration: 200,
  }));
  const lastDot = dots[dots.length - 1];
  const exit = { delay: lastDot.delay + lastDot.duration + 80, duration: motion.sheet };
  const hold = 120;
  return { hold, ring, dots, exit, total: hold + exit.delay + exit.duration };
}

/** The splash image size in app.json (`expo-splash-screen` imageWidth), so the hand-off is seamless. */
export const SPLASH_IMAGE_SIZE = 160;
