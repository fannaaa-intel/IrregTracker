import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PetalDots } from '@/components/PetalDots';
import { ScreenTitle } from '@/components/ScreenTitle';
import { AppearanceSection } from '@/features/appearance/components/AppearanceSection';
import { AppLockSection, YourDataSection } from '@/features/privacy/components/PrivacySections';
import { CycleSettingsCards } from '@/features/reminders/components/CycleSettingsCards';
import { KindNotesSection } from '@/features/reminders/components/KindNotesSection';
import { UpdateRow } from '@/features/updates/components/UpdateRow';
import { spacing, typography, useThemeColors } from '@/theme';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenTitle>Settings</ScreenTitle>

        <AppearanceSection />
        <CycleSettingsCards />
        <KindNotesSection />
        <AppLockSection />
        <YourDataSection />

        <Card>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            App
          </Text>
          <UpdateRow />
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            The app looks for a new version between 8 PM and midnight while it&apos;s open. It only
            downloads app code. Your data never leaves this phone.
          </Text>
        </Card>

        <Card>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            About
          </Text>
          <Text style={[typography.body, { color: colors.text }]}>
            Cycle Tracker is not a medical device and is not a form of contraception. Predictions,
            fertile days and ovulation are estimates from your own past cycles.
          </Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            If something about your cycle worries you, it can be worth talking to a doctor.
          </Text>
          <Button
            variant="quiet"
            label="See the welcome again"
            onPress={() => router.push('/onboarding')}
          />
        </Card>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
