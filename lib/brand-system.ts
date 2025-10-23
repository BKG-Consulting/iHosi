/**
 * iHosi Brand Design System
 * Calm, Professional Healthcare Design
 */

export const brandColors = {
  // Primary Brand Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    subtle: '#F8F8F8',
  },
  
  // Text Colors
  text: {
    primary: '#000000',
    secondary: '#1a1a1a',
    tertiary: '#404040',
    muted: '#666666',
    subtle: '#999999',
  },
  
  // Accent Color - Cyan
  accent: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Primary accent
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  
  // Amber Graphics
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Primary amber
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Supporting Colors (minimal use)
  support: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },
  
  // Neutral Grays (for subtle elements)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

export const typography = {
  fontFamily: {
    display: 'var(--font-display), system-ui, sans-serif',
    body: 'var(--font-inter), system-ui, sans-serif',
    mono: 'var(--font-geist-mono), monospace',
  },
  
  fontSize: {
    // Display sizes for headlines
    'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
    'display-xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
    'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '600' }],
    'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
    'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
    
    // Body sizes
    'body-xl': ['1.25rem', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '400' }],
    'body-lg': ['1.125rem', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '400' }],
    'body-md': ['1rem', { lineHeight: '1.625', letterSpacing: '0', fontWeight: '400' }],
    'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
    'body-xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
  },
  
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  section: {
    sm: '3rem',    // 48px
    md: '5rem',    // 80px
    lg: '8rem',    // 128px
    xl: '12rem',   // 192px
  },
  
  component: {
    xs: '0.5rem',  // 8px
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
    xl: '3rem',    // 48px
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',
} as const;

export const shadows = {
  // Subtle, calm shadows
  subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  soft: '0 2px 4px 0 rgba(0, 0, 0, 0.04)',
  medium: '0 4px 8px 0 rgba(0, 0, 0, 0.06)',
  large: '0 8px 16px 0 rgba(0, 0, 0, 0.08)',
  xlarge: '0 16px 32px 0 rgba(0, 0, 0, 0.1)',
  
  // Colored shadows (very subtle)
  cyan: '0 4px 12px 0 rgba(6, 182, 212, 0.15)',
  amber: '0 4px 12px 0 rgba(245, 158, 11, 0.15)',
} as const;

export const animations = {
  // Calm, smooth animations
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  easing: {
    // Gentle, natural easings
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    calm: 'cubic-bezier(0.3, 0, 0.2, 1)',
  },
  
  presets: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: '500ms',
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
    slideUp: {
      from: { opacity: 0, transform: 'translateY(12px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: '500ms',
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.96)' },
      to: { opacity: 1, transform: 'scale(1)' },
      duration: '400ms',
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  },
} as const;

export const gradients = {
  // Subtle amber gradients for graphics
  amberSubtle: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
  amberSoft: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
  amberGlow: 'radial-gradient(circle at center, #FCD34D 0%, transparent 70%)',
  
  // Cyan accents
  cyanSubtle: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)',
  cyanSoft: 'linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%)',
  cyanGlow: 'radial-gradient(circle at center, #22D3EE 0%, transparent 70%)',
  
  // Combined
  brandGradient: 'linear-gradient(135deg, #FFFBEB 0%, #ECFEFF 50%, #FFFFFF 100%)',
} as const;

export const patterns = {
  // Subtle background patterns
  dots: {
    color: 'rgba(0, 0, 0, 0.02)',
    size: '20px',
  },
  grid: {
    color: 'rgba(0, 0, 0, 0.02)',
    size: '32px',
  },
} as const;

// Export combined brand system
export const brandSystem = {
  colors: brandColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  gradients,
  patterns,
} as const;

