// Pink minimalist theme tokens. See docs/DESIGN.md.
// Components must import from here: no raw hex, font sizes, or spacing numbers.

export const lightColors = {
  bg: '#FFF8FA',
  surface: '#FFFFFF',
  surfaceTint: '#FCE8EF',
  border: '#F3DCE4',
  text: '#3B2A31',
  textMuted: '#7A6570',
  primary: '#C2416E',
  onPrimary: '#FFFFFF',
  primaryDeep: '#9C2F57',
  petal: '#E57A9C', // decorative only, never text
  blush: '#F7C6D5', // decorative only, never text
  notice: '#8A5A1F',
  noticeBg: '#FDF1E3',
  calm: '#2F6B4F',
} as const;

export const darkColors: Record<keyof typeof lightColors, string> = {
  bg: '#1C1418',
  surface: '#261B20',
  surfaceTint: '#3A2530',
  border: '#3A2A31',
  text: '#F7E9EE',
  textMuted: '#B9A4AD',
  primary: '#F08DAE',
  onPrimary: '#1C1418',
  primaryDeep: '#F7B8CC',
  petal: '#D9658A',
  blush: '#5A3344',
  notice: '#E8B97A',
  noticeBg: '#33261A',
  calm: '#8CC8A8',
};

export type ColorToken = keyof typeof lightColors;
export type Colors = Record<ColorToken, string>;

export type Flow = 'spotting' | 'light' | 'medium' | 'heavy';

export const flowColors: Record<Flow, { fill: string | null; droplets: 0 | 1 | 2 | 3 }> = {
  spotting: { fill: null, droplets: 0 }, // outline + dot
  light: { fill: '#F7C6D5', droplets: 1 },
  medium: { fill: '#E57A9C', droplets: 2 },
  heavy: { fill: '#C2416E', droplets: 3 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const fontFamily = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: 44, lineHeight: 48 },
  title: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30 },
  heading: { fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
} as const;

export const shadow = {
  soft: {
    shadowColor: '#C2416E',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 2,
  },
} as const;

export const motion = {
  press: 150,
  sheet: 250,
} as const;

export const touchTarget = 44;
