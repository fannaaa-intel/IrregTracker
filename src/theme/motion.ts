import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * The phone's "Reduce motion" / "Remove animations" setting (DESIGN.md §6). Starts as `null`
 * until the setting has been read, so callers can wait instead of animating by mistake.
 */
export function useReduceMotion(): boolean | null {
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (active) setReduce(value);
      },
      () => {
        if (active) setReduce(false);
      },
    );
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}
