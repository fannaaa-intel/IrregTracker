import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlagExplanation } from '@/features/flags/components/FlagExplanation';
import { isFlagType } from '@/features/flags/copy';
import { spacing, useThemeColors } from '@/theme';

/** "Why am I seeing this?" for one flag type (PLAN.md §6). */
export default function FlagExplanationScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const colors = useThemeColors();
  const router = useRouter();

  if (typeof type !== 'string' || !isFlagType(type)) return <Redirect href="/" />;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FlagExplanation type={type} onBack={back} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
