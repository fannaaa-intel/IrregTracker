import { useThemeColors } from '@/theme';

import { requestAppearance, useAppearanceChoice, useFadeRequest } from '../store';
import { AppearanceCard } from './AppearanceCard';

/** Connects the Appearance card to the store; the root <AppearanceFader> plays the switch. */
export function AppearanceSection() {
  const colors = useThemeColors();
  const choice = useAppearanceChoice();
  const pending = useFadeRequest();
  // The tapped option highlights at once, while the screen eases into the new theme.
  return (
    <AppearanceCard
      choice={pending?.to ?? choice}
      onChoose={(next) => requestAppearance(next, colors.bg)}
    />
  );
}
