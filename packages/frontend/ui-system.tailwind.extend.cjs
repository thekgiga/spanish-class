/**
 * Merge this object into `theme.extend` in tailwind.config.js during UI-system foundation work.
 * It maps semantic names to CSS variables and intentionally does not delete legacy tokens yet.
 */
module.exports = {
  colors: {
    canvas: {
      DEFAULT: 'hsl(var(--ui-canvas) / <alpha-value>)',
      subtle: 'hsl(var(--ui-canvas-subtle) / <alpha-value>)',
    },
    surface: {
      DEFAULT: 'hsl(var(--ui-surface) / <alpha-value>)',
      raised: 'hsl(var(--ui-surface-raised) / <alpha-value>)',
      muted: 'hsl(var(--ui-surface-muted) / <alpha-value>)',
      inverse: 'hsl(var(--ui-surface-inverse) / <alpha-value>)',
    },
    ink: {
      DEFAULT: 'hsl(var(--ui-fg-primary) / <alpha-value>)',
      secondary: 'hsl(var(--ui-fg-secondary) / <alpha-value>)',
      tertiary: 'hsl(var(--ui-fg-tertiary) / <alpha-value>)',
      inverse: 'hsl(var(--ui-fg-inverse) / <alpha-value>)',
    },
    line: {
      DEFAULT: 'hsl(var(--ui-border) / <alpha-value>)',
      strong: 'hsl(var(--ui-border-strong) / <alpha-value>)',
    },
    brand: {
      DEFAULT: 'hsl(var(--ui-brand) / <alpha-value>)',
      hover: 'hsl(var(--ui-brand-hover) / <alpha-value>)',
      active: 'hsl(var(--ui-brand-active) / <alpha-value>)',
      contrast: 'hsl(var(--ui-brand-contrast) / <alpha-value>)',
    },
    accent: {
      DEFAULT: 'hsl(var(--ui-accent) / <alpha-value>)',
      hover: 'hsl(var(--ui-accent-hover) / <alpha-value>)',
      soft: 'hsl(var(--ui-accent-soft) / <alpha-value>)',
    },
    focus: 'hsl(var(--ui-focus) / <alpha-value>)',
    feedback: {
      success: 'hsl(var(--ui-success) / <alpha-value>)',
      warning: 'hsl(var(--ui-warning) / <alpha-value>)',
      danger: 'hsl(var(--ui-danger) / <alpha-value>)',
      info: 'hsl(var(--ui-info) / <alpha-value>)',
    },
    // Marketing hero — always-dark cinematic section tokens
    hero: {
      bg:          'hsl(var(--ui-hero-bg) / <alpha-value>)',
      fg:          'hsl(var(--ui-hero-fg) / <alpha-value>)',
      label:       'hsl(var(--ui-hero-step-label) / <alpha-value>)',
      progress:    'hsl(var(--ui-hero-progress) / <alpha-value>)',
      ctaBg:       'hsl(var(--ui-hero-cta-bg) / <alpha-value>)',
      ctaFg:       'hsl(var(--ui-hero-cta-fg) / <alpha-value>)',
      ctaHover:    'hsl(var(--ui-hero-cta-hover) / <alpha-value>)',
    },
    // Alert surface tokens — generic feedback, independent of booking lifecycle
    alert: {
      success: {
        surface:    'hsl(var(--ui-alert-success-surface) / <alpha-value>)',
        border:     'hsl(var(--ui-alert-success-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-alert-success-foreground) / <alpha-value>)',
      },
      error: {
        surface:    'hsl(var(--ui-alert-error-surface) / <alpha-value>)',
        border:     'hsl(var(--ui-alert-error-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-alert-error-foreground) / <alpha-value>)',
      },
      warning: {
        surface:    'hsl(var(--ui-alert-warning-surface) / <alpha-value>)',
        border:     'hsl(var(--ui-alert-warning-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-alert-warning-foreground) / <alpha-value>)',
      },
      info: {
        surface:    'hsl(var(--ui-alert-info-surface) / <alpha-value>)',
        border:     'hsl(var(--ui-alert-info-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-alert-info-foreground) / <alpha-value>)',
      },
    },
    status: {
      available: {
        surface: 'hsl(var(--ui-available-surface) / <alpha-value>)',
        border: 'hsl(var(--ui-available-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-available-foreground) / <alpha-value>)',
      },
      requested: {
        surface: 'hsl(var(--ui-requested-surface) / <alpha-value>)',
        border: 'hsl(var(--ui-requested-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-requested-foreground) / <alpha-value>)',
      },
      confirmed: {
        surface: 'hsl(var(--ui-confirmed-surface) / <alpha-value>)',
        border: 'hsl(var(--ui-confirmed-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-confirmed-foreground) / <alpha-value>)',
      },
      blocked: {
        surface: 'hsl(var(--ui-blocked-surface) / <alpha-value>)',
        border: 'hsl(var(--ui-blocked-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-blocked-foreground) / <alpha-value>)',
      },
      completed: {
        surface: 'hsl(var(--ui-completed-surface) / <alpha-value>)',
        border: 'hsl(var(--ui-completed-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-completed-foreground) / <alpha-value>)',
      },
      cancelled: {
        surface: 'hsl(var(--ui-cancelled-surface) / <alpha-value>)',
        border: 'hsl(var(--ui-cancelled-border) / <alpha-value>)',
        foreground: 'hsl(var(--ui-cancelled-foreground) / <alpha-value>)',
      },
    },
  },
  fontFamily: {
    sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    display: ['Newsreader Variable', 'Newsreader', 'Playfair Display', 'ui-serif', 'Georgia', 'serif'],
  },
  fontSize: {
    micro:   ['11px', { lineHeight: '14px', fontWeight: '600' }],
    caption: ['12px', { lineHeight: '16px', fontWeight: '550' }],
    small:   ['13px', { lineHeight: '18px', fontWeight: '500' }],
    body:    ['15px', { lineHeight: '22px', fontWeight: '450' }],
    title:   ['17px', { lineHeight: '24px', fontWeight: '600' }],
    // Heading scale — used by PageHeader, section headers, and DesignSystemPage
    h3:      ['20px', { lineHeight: '26px', fontWeight: '600' }],
    h2:      ['24px', { lineHeight: '30px', fontWeight: '600' }],
    h1:      ['32px', { lineHeight: '38px', fontWeight: '700' }],
    display: ['48px', { lineHeight: '52px', fontWeight: '700' }],
  },
  borderRadius: {
    'ui-xs': 'var(--ui-radius-xs)',
    'ui-sm': 'var(--ui-radius-sm)',
    'ui-md': 'var(--ui-radius-md)',
    'ui-lg': 'var(--ui-radius-lg)',
    'ui-xl': 'var(--ui-radius-xl)',
  },
  boxShadow: {
    'ui-1': 'var(--ui-shadow-1)',
    'ui-2': 'var(--ui-shadow-2)',
    'ui-3': 'var(--ui-shadow-3)',
  },
  height: {
    'progress-bar': '3px',
  },
  transitionDuration: {
    instant: 'var(--ui-duration-instant)',
    micro: 'var(--ui-duration-micro)',
    standard: 'var(--ui-duration-standard)',
    spatial: 'var(--ui-duration-spatial)',
  },
  transitionTimingFunction: {
    'ui-enter': 'var(--ui-ease-enter)',
    'ui-exit': 'var(--ui-ease-exit)',
    'ui-standard': 'var(--ui-ease-standard)',
  },
};
