import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { PetalDots } from '@/components/PetalDots';
import { DoctorCycles } from '@/features/reports/components/DoctorCycles';
import { DoctorNotes } from '@/features/reports/components/DoctorNotes';
import { useDoctorSummary } from '@/features/reports/hooks';
import { format, todayLocal } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

/** "Summary for a doctor": an on-screen page to show at an appointment. Nothing is exported. */
export default function DoctorSummaryScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const today = todayLocal();
  const summary = useDoctorSummary(today);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/history'));

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <IconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={back} />
          <Text
            accessibilityRole="header"
            style={[typography.title, styles.title, { color: colors.text }]}
          >
            Summary for a doctor
          </Text>
        </View>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          {summary?.from != null
            ? `From your own logs, ${format(summary.from, { withYear: true })} to ${format(today, { withYear: true })}.`
            : 'From your own logs.'}{' '}
          Show this screen at an appointment. It stays on this phone, and it isn&apos;t a diagnosis.
        </Text>
        {summary !== undefined ? (
          <>
            <DoctorCycles summary={summary} />
            <DoctorNotes summary={summary} />
          </>
        ) : null}
        <PetalDots />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
});
