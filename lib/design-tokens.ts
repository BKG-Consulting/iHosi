/**
 * Design Tokens for Landing Page
 * Healthcare-focused design system
 */

export const designTokens = {
  // Color System
  colors: {
    primary: {
      blue: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#0066FF',
        600: '#0052CC',
        700: '#0041A3',
        800: '#003380',
        900: '#002660',
      },
      indigo: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        500: '#4F46E5',
        600: '#4338CA',
        700: '#3730A3',
      },
      emerald: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
      },
      purple: {
        50: '#F5F3FF',
        100: '#EDE9FE',
        500: '#8B5CF6',
        600: '#7C3AED',
        700: '#6D28D9',
      },
    },
    accent: {
      orange: '#F59E0B',
      pink: '#EC4899',
      teal: '#14B8A6',
      amber: '#F59E0B',
    },
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
  },

  // Typography
  typography: {
    fonts: {
      display: 'var(--font-cal-sans, ui-sans-serif)',
      body: 'var(--font-inter, system-ui)',
      mono: 'var(--font-mono, ui-monospace)',
    },
    sizes: {
      hero: '4.5rem', // 72px
      h1: '3.5rem',   // 56px
      h2: '2.5rem',   // 40px
      h3: '2rem',     // 32px
      h4: '1.5rem',   // 24px
      h5: '1.25rem',  // 20px
      body: '1.125rem', // 18px
      sm: '0.875rem', // 14px
      xs: '0.75rem',  // 12px
    },
    lineHeights: {
      tight: '1.1',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },
  },

  // Spacing
  spacing: {
    section: '10rem',     // 160px
    sectionMobile: '5rem', // 80px
    container: '80rem',    // 1280px
    gutter: '2rem',        // 32px
    gutterMobile: '1rem',  // 16px
  },

  // Border Radius
  radius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 20px rgba(0, 102, 255, 0.3)',
  },

  // Glassmorphism
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.18)',
      blur: '10px',
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.7)',
      border: 'rgba(148, 163, 184, 0.18)',
      blur: '10px',
    },
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Gradient presets
export const gradients = {
  primary: 'linear-gradient(135deg, #0066FF 0%, #4F46E5 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
  accent: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  warm: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  mesh: 'radial-gradient(at 40% 20%, #0066FF 0px, transparent 50%), radial-gradient(at 80% 0%, #4F46E5 0px, transparent 50%), radial-gradient(at 0% 50%, #10B981 0px, transparent 50%)',
} as const;

// Component-specific tokens
export const componentTokens = {
  card: {
    padding: '2rem',
    radius: '1.5rem',
    shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  button: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
      xl: '3.5rem',
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
      xl: '1.25rem 2.5rem',
    },
  },
  input: {
    height: '2.75rem',
    radius: '0.75rem',
  },
} as const;

