import { flowColors, lightColors, type Flow } from '../../theme';

/** Calendar fill for a flow, or null for spotting (outline + dot only). */
export function flowFill(flow: Flow): string | null {
  return flowColors[flow].fill;
}

/**
 * Day-number color on a flow fill. The fills are the same in light and dark mode, so the
 * text uses fixed light-palette tokens that reach 4.5:1 on each (checked in flow-style.test).
 * Returns null when there is no fill and the normal theme text color applies.
 */
export function onFlowText(flow: Flow): string | null {
  if (flowFill(flow) === null) return null;
  return flow === 'heavy' ? lightColors.onPrimary : lightColors.text;
}

export function dropletCount(flow: Flow): 0 | 1 | 2 | 3 {
  return flowColors[flow].droplets;
}
