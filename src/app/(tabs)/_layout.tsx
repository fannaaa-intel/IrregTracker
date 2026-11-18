import { Tabs } from 'expo-router/js-tabs';
import { CalendarDays, ChartColumn, House, Settings, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, type ColorValue } from 'react-native';

import { TabButton } from '@/components/TabButton';
import { typography, useReduceMotion, useThemeColors } from '@/theme';

// DESIGN.md §4.6: line icons, stroke 1.5, size 22, textMuted (primary when active).
const ICON_SIZE = 22;
const ICON_STROKE = 1.5;

function tabIcon(Icon: LucideIcon) {
  function TabIcon({ color }: { color: ColorValue }) {
    // Our tint colors are always hex strings; lucide only accepts string colors.
    const stroke = typeof color === 'string' ? color : undefined;
    return <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} color={stroke} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: typography.label,
        // No Android ripple on the tabs; a quiet opacity press instead.
        tabBarButton: (props) => <TabButton {...props} />,
        // Soft cross-fade between tabs (respects the system's animation settings).
        animation: reduceMotion ? 'none' : 'fade',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar', tabBarIcon: tabIcon(CalendarDays) }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: tabIcon(ChartColumn) }}
      />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon(Settings) }} />
    </Tabs>
  );
}
