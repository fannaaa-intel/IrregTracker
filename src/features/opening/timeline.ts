// The opening animation's timing (pure, so DESIGN.md §6 limits are tested). Every single motion is
// 250 ms or less; they overlap so the whole thing feels like one soft breath (about 1.3 s).
// Starts from the exact native splash frame (logo tile, 160 dp, centred), then:
//   bloom  – two blush blobs grow softly in the corners
//   ring   – the cycle ring from Home draws around the logo (track, petal arc, blush window)
//   name   – the app name and a one-line promise rise under the logo
//   dots   – four petal dots appear one by one (the divider motif)
//   exit   – everything fades while the logo eases up very slightly, revealing the app
import { motion } from '../../theme';

export type Step = { delay: number; duration: number };

export type OpeningTimeline = {
  /** Hold the splash frame while the app's first render settles, so nothing stutters. */
  hold: number;
  bloom: Step;
  ring: Step;
  window: Step;
  name: Step;
  tagline: Step;
  dots: Step[];
  exit: Step;
  /** When the overlay is gone and can be removed. */
  total: number;
};

const DOT_COUNT = 4;
const DOT_STAGGER = 60;
const NONE: Step = { delay: 0, duration: 0 };

export function openingTimeline(reduceMotion: boolean): OpeningTimeline {
  if (reduceMotion) {
    // No movement at all: just a short cross-fade from the splash to the app.
    const exit = { delay: 0, duration: motion.press };
    return {
      hold: 0,
      bloom: NONE,
      ring: NONE,
      window: NONE,
      name: NONE,
      tagline: NONE,
      dots: [],
      exit,
      total: exit.duration,
    };
  }
  const bloom = { delay: 0, duration: motion.sheet };
  const ring = { delay: 60, duration: motion.sheet };
  const window = { delay: 260, duration: 200 };
  const name = { delay: 220, duration: motion.sheet };
  const tagline = { delay: 300, duration: motion.sheet };
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => ({
    delay: 420 + i * DOT_STAGGER,
    duration: 200,
  }));
  const lastDot = dots[dots.length - 1];
  // A short, still moment with everything in place before the app appears.
  const exit = { delay: lastDot.delay + lastDot.duration + 260, duration: motion.sheet };
  const hold = 100;
  return {
    hold,
    bloom,
    ring,
    window,
    name,
    tagline,
    dots,
    exit,
    total: hold + exit.delay + exit.duration,
  };
}

/** The splash image size in app.json (`expo-splash-screen` imageWidth), so the hand-off is seamless. */
export const SPLASH_IMAGE_SIZE = 160;

export const OPENING_NAME = 'Cycle Tracker';
export const OPENING_TAGLINE = 'A calm place for your cycle';
