import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { BackupRestore } from '@/features/backup/components/BackupRestore';
import { useBackup } from '@/features/backup/hooks';
import { spacing, typography, useThemeColors } from '@/theme';

export default function BackupRestoreScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { pickBackupFile, openBackup, restoreBackup } = useBackup();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/settings'));

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={back} />
        <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
          Restore a backup
        </Text>
        <BackupRestore
          onPickFile={pickBackupFile}
          onOpen={openBackup}
          onRestore={restoreBackup}
          onDone={back}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
