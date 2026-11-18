import { Linking } from 'react-native';

import { todayLocal } from '@/lib/date';

import { useKindNotes } from '../hooks';
import { phraseForDay } from '../logic';
import { KindNotesCard } from './KindNotesCard';

/** Connects the Kind notes card to stored settings and the scheduler. */
export function KindNotesSection() {
  const { settings, blocked, setEnabled, setTime } = useKindNotes();
  if (settings === undefined) return null;

  return (
    <KindNotesCard
      enabled={settings.enabled}
      time={settings.time}
      blocked={blocked}
      example={phraseForDay(todayLocal())}
      onToggle={(enabled) => void setEnabled(enabled)}
      onTimeChange={(time) => void setTime(time)}
      onOpenPhoneSettings={() => void Linking.openSettings()}
    />
  );
}
