// Default palette = "Parchment Dark". Static-imported by `import { colors }`
// for legacy call sites. Theme-aware code paths should call `useThemeColors()`
// from UserContext so the active palette flows in via React state.
export const colors = {
  // Backgrounds - deep midnight with a hint of ultramarine, like a starless sky over ruins
  bgDeep: '#070A14',
  bg: '#0B0F1C',
  bgElevated: '#131827',
  bgCard: 'rgba(22, 28, 44, 0.72)',
  bgCardSolid: '#161C2C',
  bgGlass: 'rgba(255, 235, 200, 0.04)',

  // Gold/amber - aged bronze and torchlight
  gold: '#E8C974',
  goldBright: '#F5D98A',
  goldDeep: '#B88F3E',
  goldSoft: 'rgba(232, 201, 116, 0.18)',
  amber: '#D49A3D',

  // Text - parchment and bone
  textPrimary: '#F5E8D0',
  textSecondary: 'rgba(245, 232, 208, 0.72)',
  textMuted: 'rgba(245, 232, 208, 0.45)',
  textLocked: 'rgba(245, 232, 208, 0.32)',

  // Accents
  emerald: '#5FB37A',
  emeraldDeep: '#3E8256',
  crimson: '#D85466',
  royal: '#8A6BC7',
  royalDeep: '#6B4FA8',

  // Borders
  border: 'rgba(232, 201, 116, 0.18)',
  borderSubtle: 'rgba(245, 232, 208, 0.08)',
  borderStrong: 'rgba(232, 201, 116, 0.45)',

  // Overlays
  overlay: 'rgba(7, 10, 20, 0.72)',
  overlayDark: 'rgba(0, 0, 0, 0.55)',

  // Background gradient stops (used by HomeScreen / ProfileScreen).
  gradient: ['#0A1024', '#141B30', '#1F2238', '#2A2633'],
};

// Per-theme overrides. Anything not listed inherits from the default palette
// above. These overrides are deliberately minimal — only the surfaces that
// the user actually sees changing when they cycle themes.
export const THEME_PALETTES = {
  'Parchment Dark': {}, // baseline = colors above

  'Parchment Light': {
    bgDeep: '#F1E6CC',
    bg: '#F5ECD4',
    bgElevated: '#E8DBB8',
    bgCard: 'rgba(232, 219, 184, 0.85)',
    bgCardSolid: '#E8DBB8',
    bgGlass: 'rgba(120, 80, 30, 0.06)',
    gold: '#9A6F1E',
    goldBright: '#B88B30',
    goldDeep: '#6B4A0E',
    goldSoft: 'rgba(154, 111, 30, 0.18)',
    textPrimary: '#2A1E10',
    textSecondary: 'rgba(42, 30, 16, 0.72)',
    textMuted: 'rgba(42, 30, 16, 0.5)',
    textLocked: 'rgba(42, 30, 16, 0.3)',
    border: 'rgba(154, 111, 30, 0.28)',
    borderSubtle: 'rgba(42, 30, 16, 0.10)',
    borderStrong: 'rgba(154, 111, 30, 0.5)',
    overlay: 'rgba(245, 236, 212, 0.75)',
    overlayDark: 'rgba(60, 40, 20, 0.45)',
    gradient: ['#F5ECD4', '#EADFBC', '#E1D2A8', '#D5C292'],
  },

};

export function getColors(themeName) {
  const overrides = THEME_PALETTES[themeName] || {};
  return { ...colors, ...overrides };
}

export const fonts = {
  display: 'Arial',
  displayRegular: 'Arial',
  heading: 'Arial',
  headingItalic: 'Arial',
  serif: 'Arial',
  serifBold: 'Arial',
  serifItalic: 'Arial',
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const shadows = {
  gold: {
    shadowColor: '#E8C974',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  deep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
};
