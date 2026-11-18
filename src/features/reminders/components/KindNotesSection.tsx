import { Linking } from 'react-native';

import { todayLocal } from '@/lib/date';

import { useKindNotes } from '../hooks';
import { phraseForDay } from '../logic';
import { KindNotesCard } from './KindNotesCard';

/** Connects the Kind notes card to stored settings and the scheduler. */
export function KindNotesSection() {
  const { settings, denied, setEnabled, setHour } = useKindNotes();
  if (settings === undefined) return null;

  return (
    <KindNotesCard
      enabled={settings.enabled}
      hour={settings.hour}
      denied={denied}
      example={phraseForDay(todayLocal())}
      onToggle={(enabled) => void setEnabled(enabled)}
      onHourChange={(hour) => void setHour(hour)}
      onOpenPhoneSettings={() => void Linking.openSettings()}
    />
  );
}
