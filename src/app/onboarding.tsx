import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Onboarding } from '@/features/onboarding/components/Onboarding';
import { useFinishOnboarding } from '@/features/onboarding/hooks';
import { useStartKindNotes } from '@/features/reminders/hooks';
import { spacing, useThemeColors } from '@/theme';

/** First-launch welcome. Finishing or skipping it is remembered; it never shows again. */
export default function OnboardingScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const finish = useFinishOnboarding();
  const startKindNotes = useStartKindNotes();

  const onFinish = async (backfill: boolean) => {
    await finish();
    // One-time system prompt; the notes themselves stay a surprise.
    await startKindNotes();
    if (backfill) router.replace({ pathname: '/calendar', params: { backfill: '1' } });
    else router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Onboarding onFinish={(backfill) => void onFinish(backfill)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
