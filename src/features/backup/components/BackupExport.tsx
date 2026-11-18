import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { spacing, typography, useThemeColors } from '@/theme';

import { passphraseProblem } from '../format';
import { PassphraseField } from './PassphraseField';

type Props = {
  /** Encrypts everything with the passphrase and opens the share sheet. */
  onExport: (passphrase: string) => Promise<void>;
  onDone: () => void;
};

type Step = 'form' | 'working' | 'shared' | 'failed';

/** Settings → Save a backup. */
export function BackupExport({ onExport, onDone }: Props) {
  const colors = useThemeColors();
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<Step>('form');
  const problem = passphraseProblem(passphrase, confirm);
  const showProblem = confirm.length > 0 && problem !== null;

  const run = async () => {
    setStep('working');
    try {
      await onExport(passphrase);
      setStep('shared');
    } catch {
      // Never log the passphrase or data (CLAUDE.md §1.3).
      setStep('failed');
    } finally {
      setPassphrase('');
      setConfirm('');
    }
  };

  if (step === 'shared') {
    return (
      <Card>
        <Text style={[typography.heading, { color: colors.calm }]}>Backup ready</Text>
        <Text style={[typography.body, { color: colors.text }]}>
          If you saved it to Google Drive or Files, you&apos;re all set. Keep your passphrase
          somewhere safe too.
        </Text>
        <Button label="Done" onPress={onDone} />
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[typography.body, { color: colors.text }]}>
        Your backup is locked with a passphrase you choose. Without it, nobody can open the backup,
        including you, so keep it somewhere safe.
      </Text>
      <PassphraseField
        label="Passphrase"
        value={passphrase}
        onChangeText={setPassphrase}
        editable={step !== 'working'}
      />
      <PassphraseField
        label="Repeat passphrase"
        value={confirm}
        onChangeText={setConfirm}
        editable={step !== 'working'}
      />
      {showProblem ? (
        <Text style={[typography.caption, { color: colors.notice }]}>{problem}</Text>
      ) : null}
      {step === 'failed' ? (
        <Text style={[typography.body, { color: colors.notice }]}>
          The backup couldn&apos;t be saved. Please try again.
        </Text>
      ) : null}
      <Button
        label={step === 'working' ? 'Locking your backup…' : 'Create backup'}
        onPress={() => void run()}
        disabled={problem !== null || step === 'working'}
      />
      {step === 'working' ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          This takes a few seconds.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
