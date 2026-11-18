import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type Colors } from './tokens';

export * from './tokens';

export function useThemeColors(): Colors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

export { useReduceMotion } from './motion';
