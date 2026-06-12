/**
 * Sleepify design tokens — "midnight luxury".
 * Deep indigo-black base, soft periwinkle/lavender accents,
 * warm candlelight amber for wake states, glass surfaces.
 */

export const palette = {
  // Backdrop gradient stops, top → bottom.
  night0: '#06070D',
  night1: '#0B0D1C',
  night2: '#131530',
  night3: '#1B1838',

  // Accents
  periwinkle: '#A5B4FF',
  lavender: '#C9BDFF',
  violet: '#6F6AF8',
  violetDeep: '#3F3D8F',

  // Warm (wake / awake-in-bed)
  amber: '#F2C98A',
  amberDeep: '#B8854A',
  ember: '#E8A87C',

  danger: '#F08C8C',
};

export const colors = {
  text: '#F4F5FB',
  textDim: '#9FA3C2',
  textFaint: '#5E6285',

  glass: 'rgba(255,255,255,0.045)',
  glassStrong: 'rgba(255,255,255,0.08)',
  hairline: 'rgba(255,255,255,0.07)',

  accent: palette.periwinkle,
  sleep: palette.periwinkle,
  awake: palette.amber,
  danger: palette.danger,
};

export const gradients = {
  backdrop: [palette.night0, palette.night1, palette.night2] as const,
  orb: ['#34317A', '#23215C', '#15142E'] as const,
  orbRim: ['rgba(165,180,255,0.55)', 'rgba(111,106,248,0.08)'] as const,
  wake: ['#F4D9A6', '#E8A87C'] as const,
  sleepBar: ['#B9C4FF', '#6F6AF8'] as const,
};

export const type = {
  // Inter font family names registered in App.tsx.
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const radius = {
  card: 24,
  sheet: 32,
  pill: 999,
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
};

/** Uppercase micro-label style used across the app. */
export const microLabel = {
  fontFamily: type.semibold,
  fontSize: 11,
  letterSpacing: 1.6,
  textTransform: 'uppercase' as const,
  color: colors.textFaint,
};
