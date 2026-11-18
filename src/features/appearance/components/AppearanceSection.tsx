import { useThemeColors } from '@/theme';

import { requestAppearance, useAppearanceChoice } from '../store';
import { AppearanceCard } from './AppearanceCard';

/** Connects the Appearance card to the store; the root <AppearanceFader> plays the switch. */
export function AppearanceSection() {
  const colors = useThemeColors();
  const choice = useAppearanceChoice();
  return <AppearanceCard choice={choice} onChoose={(next) => requestAppearance(next, colors.bg)} />;
}
