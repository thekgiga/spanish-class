/**
 * Design Tokens
 * Central source of truth for design system values
 * Based on 8px spacing system and Spanish-inspired color palette
 */

// ============================================================================
// Color System
// ============================================================================

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ColorSystem {
  brand: {
    primary: ColorScale; // Spanish Red
    secondary: ColorScale; // Gold
  };
  neutral: ColorScale; // Warm clay neutrals
  accent: {
    terracotta: ColorScale;
    olive: ColorScale;
    cream: ColorScale;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const colors: ColorSystem = {
  brand: {
    primary: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#B91C1C', // Primary - 5.6:1 contrast on white
      700: '#991B1B',
      800: '#7F1D1D',
      900: '#6B1717',
      950: '#450A0A',
    },
    secondary: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706', // Secondary - 4.7:1 contrast on white
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
  },
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },
  accent: {
    terracotta: {
      50: '#FDF8F6',
      100: '#F2E8E5',
      200: '#EADDD7',
      300: '#E0CEC7',
      400: '#D2BAB0',
      500: '#BFA094',
      600: '#A18072',
      700: '#977669',
      800: '#846358',
      900: '#43302B',
      950: '#2D1F1A',
    },
    olive: {
      50: '#F6F7F4',
      100: '#E3E8DC',
      200: '#C7D1B8',
      300: '#A3B38E',
      400: '#829668',
      500: '#657C4F',
      600: '#4E623D',
      700: '#3D4C31',
      800: '#33402A',
      900: '#2C3625',
      950: '#151B11',
    },
    cream: {
      50: '#FDFBF7',
      100: '#F9F3E8',
      200: '#F3E8D5',
      300: '#EBD9BA',
      400: '#E0C599',
      500: '#D4AF76',
      600: '#C89A5C',
      700: '#B37F43',
      800: '#8F6538',
      900: '#74532F',
      950: '#3E2B18',
    },
  },
  semantic: {
    success: '#10B981', // Green 500 - 3.2:1 contrast
    warning: '#F59E0B', // Amber 500 - 2.8:1 contrast
    error: '#EF4444', // Red 500 - 3.9:1 contrast
    info: '#3B82F6', // Blue 500 - 4.6:1 contrast
  },
};

// ============================================================================
// Typography System
// ============================================================================

export interface TypographyScale {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight?: number;
}

export interface TypographySystem {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: TypographyScale;
    sm: TypographyScale;
    base: TypographyScale;
    lg: TypographyScale;
    xl: TypographyScale;
    '2xl': TypographyScale;
    '3xl': TypographyScale;
    '4xl': TypographyScale;
    '5xl': TypographyScale;
    '6xl': TypographyScale;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export const typography: TypographySystem = {
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
    serif: '"Playfair Display", ui-serif, Georgia, serif',
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace',
  },
  fontSize: {
    xs: { fontSize: '0.75rem', lineHeight: '1rem' }, // 12px
    sm: { fontSize: '0.875rem', lineHeight: '1.25rem' }, // 14px
    base: { fontSize: '1rem', lineHeight: '1.5rem' }, // 16px
    lg: { fontSize: '1.125rem', lineHeight: '1.75rem' }, // 18px
    xl: { fontSize: '1.25rem', lineHeight: '1.75rem' }, // 20px
    '2xl': { fontSize: '1.5rem', lineHeight: '2rem' }, // 24px
    '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem', letterSpacing: '-0.02em' }, // 36px
    '5xl': { fontSize: '3rem', lineHeight: '1', letterSpacing: '-0.02em' }, // 48px
    '6xl': { fontSize: '3.75rem', lineHeight: '1', letterSpacing: '-0.02em' }, // 60px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// ============================================================================
// Spacing System (8px base unit)
// ============================================================================

export interface SpacingSystem {
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export const spacing: SpacingSystem = {
  0: '0px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px (base unit)
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
};

// ============================================================================
// Shadow System
// ============================================================================

export interface ShadowSystem {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export const shadows: ShadowSystem = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// ============================================================================
// Border Radius System
// ============================================================================

export interface RadiusSystem {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export const radius: RadiusSystem = {
  none: '0px',
  sm: '0.125rem', // 2px
  base: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

// ============================================================================
// Animation System
// ============================================================================

export interface AnimationSystem {
  duration: {
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    spring: string;
  };
}

export const animation: AnimationSystem = {
  duration: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// ============================================================================
// Breakpoints System
// ============================================================================

export interface BreakpointSystem {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export const breakpoints: BreakpointSystem = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// Z-Index System
// ============================================================================

export interface ZIndexSystem {
  dropdown: number;
  sticky: number;
  fixed: number;
  modalBackdrop: number;
  modal: number;
  popover: number;
  tooltip: number;
}

export const zIndex: ZIndexSystem = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ============================================================================
// Export All Tokens
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  radius,
  animation,
  breakpoints,
  zIndex,
} as const;

export default designTokens;
