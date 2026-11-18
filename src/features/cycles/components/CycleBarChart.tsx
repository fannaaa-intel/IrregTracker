import { Tag } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { format } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

import type { ClosedCycle } from '../logic';
import { RECENT_CYCLES } from '../summary';

// Single series, so no legend: the title names it. Thin bars with 4px rounded tops on the
// baseline, 2px+ gaps, a dashed typical line, recessive grid. Tap a bar to read it.
const HEIGHT = 168;
const AXIS = 28;
const TOP = 22;
const BOTTOM = 6;
const MAX_BAR = 22;
const CORNER = 4;
const TAG_ICON = 12;

type Props = {
  /** Closed cycles, newest first (counted and not). */
  cycles: readonly ClosedCycle[];
  /** Starts of cycles that don't count (tagged, or awaiting confirmation). */
  notCounted: ReadonlySet<string>;
  typical: number | null;
};

function barPath(x: number, y: number, width: number, base: number): string {
  const r = Math.min(CORNER, width / 2, base - y);
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${base} Z`;
}

export function CycleBarChart({ cycles, notCounted, typical }: Props) {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);
  const bars = cycles.slice(0, RECENT_CYCLES).reverse(); // oldest → newest
  const [selected, setSelected] = useState(bars.length - 1);
  const current = bars[Math.min(selected, bars.length - 1)];

  const maxLength = Math.max(...bars.map((c) => c.length), typical ?? 0);
  const yMax = Math.max(40, Math.ceil(maxLength / 10) * 10);
  const base = HEIGHT - BOTTOM;
  const y = (value: number) => TOP + (1 - value / yMax) * (base - TOP);
  const slot = bars.length === 0 ? 0 : (width - AXIS) / bars.length;
  const barWidth = Math.max(Math.min(MAX_BAR, slot - 4), 2);
  const barX = (i: number) => AXIS + i * slot + (slot - barWidth) / 2;

  const spoken = `Cycle lengths, oldest to newest: ${bars.map((c) => c.length).join(', ')} days.${
    typical === null ? '' : ` Typical ${typical} days.`
  }`;

  return (
    <View style={styles.container}>
      {current !== undefined ? (
        <Text accessibilityLiveRegion="polite" style={[typography.label, { color: colors.text }]}>
          Started {format(current.start)} · {current.length} days
          {notCounted.has(current.start) ? ' · not counted' : ''}
        </Text>
      ) : null}
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={spoken}
        onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
        style={styles.chart}
      >
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {[0, yMax / 2, yMax].map((tick) => (
              <Line
                key={`g${tick}`}
                x1={AXIS}
                x2={width}
                y1={y(tick)}
                y2={y(tick)}
                stroke={colors.border}
                strokeWidth={1}
              />
            ))}
            {[0, yMax / 2, yMax].map((tick) => (
              <SvgText
                key={`t${tick}`}
                x={AXIS - 6}
                y={y(tick) + 4}
                textAnchor="end"
                fontSize={typography.caption.fontSize}
                fontFamily={typography.caption.fontFamily}
                fill={colors.textMuted}
              >
                {tick}
              </SvgText>
            ))}
            {bars.map((cycle, i) => {
              const counted = !notCounted.has(cycle.start);
              const fill = i === selected ? colors.primary : counted ? colors.petal : colors.border;
              return (
                <Path
                  key={cycle.start}
                  d={barPath(barX(i), y(cycle.length), barWidth, base)}
                  fill={fill}
                />
              );
            })}
            {typical !== null ? (
              <>
                <Line
                  x1={AXIS}
                  x2={width}
                  y1={y(typical)}
                  y2={y(typical)}
                  stroke={colors.primary}
                  strokeWidth={1.5}
                  strokeDasharray={[4, 4]}
                />
                <SvgText
                  x={width}
                  y={y(typical) - 6}
                  textAnchor="end"
                  fontSize={typography.caption.fontSize}
                  fontFamily={typography.caption.fontFamily}
                  fill={colors.textMuted}
                >
                  {`Typical ${typical}`}
                </SvgText>
              </>
            ) : null}
            {bars.map((cycle, i) => (
              <Rect
                key={`hit${cycle.start}`}
                x={AXIS + i * slot}
                y={0}
                width={slot}
                height={HEIGHT}
                fill="transparent"
                onPress={() => setSelected(i)}
              />
            ))}
          </Svg>
        ) : null}
        {width > 0
          ? bars.map((cycle, i) =>
              notCounted.has(cycle.start) ? (
                <View
                  key={`tag${cycle.start}`}
                  pointerEvents="none"
                  style={[
                    styles.tag,
                    {
                      left: barX(i) + barWidth / 2 - TAG_ICON / 2,
                      top: y(cycle.length) - TAG_ICON - 3,
                    },
                  ]}
                >
                  <Tag size={TAG_ICON} strokeWidth={1.5} color={colors.textMuted} />
                </View>
              ) : null,
            )
          : null}
      </View>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        Last {bars.length} {bars.length === 1 ? 'cycle' : 'cycles'}, oldest to newest. Tap a bar to
        see it. Tagged cycles are grey and not counted.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chart: {
    height: HEIGHT,
  },
  tag: {
    position: 'absolute',
  },
});
