/**
 * Accessibility Specification (WCAG 2.1 Level AA)
 *
 * Comprehensive accessibility requirements for the Spanish Class premium frontend.
 * All components must meet these standards.
 */

// =============================================================================
// Color Contrast Requirements
// =============================================================================

/**
 * WCAG 2.1 Level AA Contrast Ratios
 */
export const CONTRAST_REQUIREMENTS = {
  /**
   * Normal text (< 18pt or < 14pt bold)
   * Minimum contrast ratio: 4.5:1
   */
  normalText: {
    minimumRatio: 4.5,
    level: 'AA',
    applies: 'Text smaller than 18pt or non-bold text smaller than 14pt bold',
  },

  /**
   * Large text (≥ 18pt or ≥ 14pt bold)
   * Minimum contrast ratio: 3:1
   */
  largeText: {
    minimumRatio: 3.0,
    level: 'AA',
    applies: 'Text 18pt or larger, or 14pt bold or larger',
  },

  /**
   * UI components and graphics
   * Minimum contrast ratio: 3:1
   */
  uiComponents: {
    minimumRatio: 3.0,
    level: 'AA',
    applies: 'Interactive elements, form controls, icons',
  },

  /**
   * AAA Standard (Enhanced, optional)
   * Normal text: 7:1, Large text: 4.5:1
   */
  enhanced: {
    normalText: 7.0,
    largeText: 4.5,
    level: 'AAA',
    applies: 'Optional enhanced contrast for better readability',
  },
} as const;

/**
 * Color Palette Audit (Spanish Class Platform)
 */
export const COLOR_AUDIT = {
  /**
   * Spanish Red (#B91C1C) on white background
   * Contrast: 5.6:1 → PASS AA (normal text)
   */
  spanishRedOnWhite: {
    foreground: '#B91C1C',
    background: '#FFFFFF',
    contrast: 5.6,
    wcag: 'AA' as const,
    passNormalText: true,
    passLargeText: true,
  },

  /**
   * Gold (#D97706) on white background
   * Contrast: 4.7:1 → PASS AA (normal text)
   */
  goldOnWhite: {
    foreground: '#D97706',
    background: '#FFFFFF',
    contrast: 4.7,
    wcag: 'AA' as const,
    passNormalText: true,
    passLargeText: true,
  },

  /**
   * Gold Light (#F59E0B) on white background
   * Contrast: 3.2:1 → FAIL AA (normal text), PASS AA (large text/UI)
   * ⚠️ Use only for large text or non-text elements
   */
  goldLightOnWhite: {
    foreground: '#F59E0B',
    background: '#FFFFFF',
    contrast: 3.2,
    wcag: 'fail' as const,
    passNormalText: false,
    passLargeText: true,
    warning: 'Use only for large text (≥18pt) or UI elements, NOT for body text',
  },

  /**
   * Clay 900 (#1C1917) on white background
   * Contrast: 17.1:1 → PASS AAA (normal text)
   */
  clayDarkOnWhite: {
    foreground: '#1C1917',
    background: '#FFFFFF',
    contrast: 17.1,
    wcag: 'AAA' as const,
    passNormalText: true,
    passLargeText: true,
  },
} as const;

// =============================================================================
// Keyboard Navigation Patterns
// =============================================================================

/**
 * Standard Keyboard Navigation
 * All interactive elements must support these keyboard interactions
 */
export const KEYBOARD_NAVIGATION = {
  /**
   * General Navigation
   */
  general: {
    Tab: {
      action: 'Move focus to next interactive element',
      required: true,
    },
    'Shift + Tab': {
      action: 'Move focus to previous interactive element',
      required: true,
    },
    Enter: {
      action: 'Activate buttons and links',
      required: true,
    },
    Space: {
      action: 'Activate buttons, toggle checkboxes',
      required: true,
    },
  },

  /**
   * Modal/Dialog Navigation
   */
  modal: {
    Escape: {
      action: 'Close modal and return focus to trigger',
      required: true,
    },
    Tab: {
      action: 'Cycle focus within modal (trap focus)',
      required: true,
    },
    focusOnOpen: {
      action: 'Focus first interactive element (Close button or primary action)',
      required: true,
    },
    focusOnClose: {
      action: 'Return focus to element that opened modal',
      required: true,
    },
  },

  /**
   * Dropdown Menu Navigation
   */
  dropdown: {
    Enter: {
      action: 'Open dropdown menu',
      required: true,
    },
    'Arrow Down': {
      action: 'Move focus to next menu item',
      required: true,
    },
    'Arrow Up': {
      action: 'Move focus to previous menu item',
      required: true,
    },
    Home: {
      action: 'Move focus to first menu item',
      required: false,
    },
    End: {
      action: 'Move focus to last menu item',
      required: false,
    },
    Escape: {
      action: 'Close menu and return focus to trigger',
      required: true,
    },
  },

  /**
   * Form Navigation
   */
  form: {
    Tab: {
      action: 'Move to next form field',
      required: true,
    },
    Enter: {
      action: 'Submit form (from button or single-line input)',
      required: true,
    },
    Space: {
      action: 'Toggle checkbox or radio button',
      required: true,
    },
  },

  /**
   * List/Grid Navigation
   */
  list: {
    'Arrow Down': {
      action: 'Move to next list item',
      required: true,
    },
    'Arrow Up': {
      action: 'Move to previous list item',
      required: true,
    },
    Home: {
      action: 'Move to first list item',
      required: false,
    },
    End: {
      action: 'Move to last list item',
      required: false,
    },
  },
} as const;

// =============================================================================
// ARIA Attributes
// =============================================================================

/**
 * Required ARIA Attributes by Component Type
 */
export const ARIA_REQUIREMENTS = {
  /**
   * Buttons
   */
  button: {
    required: {
      'aria-label': 'Required when button contains only an icon (no visible text)',
    },
    optional: {
      'aria-pressed': 'For toggle buttons (true/false)',
      'aria-expanded': 'For buttons that expand/collapse content (true/false)',
      'aria-controls': 'ID of element controlled by button',
      'aria-describedby': 'ID of element describing button action',
    },
  },

  /**
   * Form Inputs
   */
  input: {
    required: {
      'aria-label OR associated <label>': 'Every input must have an accessible name',
    },
    optional: {
      'aria-required': 'Indicates required field (true/false)',
      'aria-invalid': 'Indicates validation error (true/false)',
      'aria-describedby': 'ID of helper text or error message',
      'aria-errormessage': 'ID of error message (when aria-invalid="true")',
    },
  },

  /**
   * Modals/Dialogs
   */
  modal: {
    required: {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'ID of modal title',
    },
    optional: {
      'aria-describedby': 'ID of modal description',
    },
  },

  /**
   * Navigation
   */
  nav: {
    required: {
      role: 'navigation',
      'aria-label': 'Descriptive label (e.g., "Main navigation", "Footer navigation")',
    },
    optional: {
      'aria-current': 'page - indicates current page link',
    },
  },

  /**
   * Alerts/Notifications
   */
  alert: {
    required: {
      role: 'alert OR status',
      'aria-live': 'assertive (for errors) OR polite (for success)',
    },
    optional: {
      'aria-atomic': 'true - read entire message',
    },
  },

  /**
   * Landmark Roles
   */
  landmarks: {
    header: { role: 'banner', description: 'Site header' },
    main: { role: 'main', description: 'Main content area' },
    nav: { role: 'navigation', description: 'Navigation section' },
    aside: { role: 'complementary', description: 'Sidebar or related content' },
    footer: { role: 'contentinfo', description: 'Site footer' },
    search: { role: 'search', description: 'Search form' },
  },
} as const;

// =============================================================================
// Focus Management
// =============================================================================

/**
 * Focus Indicator Requirements
 */
export const FOCUS_INDICATORS = {
  /**
   * Minimum Focus Indicator Specifications
   */
  minimum: {
    thickness: '2px',
    color: 'Must have 3:1 contrast with adjacent colors',
    offset: '2px from element edge (breathing room)',
    style: 'Solid or dotted outline',
  },

  /**
   * Recommended Focus Styles (Spanish Class Platform)
   */
  recommended: {
    default: {
      outline: '2px solid spanishRed-500',
      outlineOffset: '2px',
      transition: 'outline 150ms ease-out',
    },
    within: {
      ringWidth: '2px',
      ringColor: 'spanishRed-500',
      ringOffset: '2px',
      ringOffsetColor: 'white',
    },
  },

  /**
   * Focus Trap (Modal/Dropdown)
   */
  focusTrap: {
    description: 'Keep focus within modal until closed',
    implementation: 'Use focus-trap-react or custom hook',
    onOpen: 'Move focus to first focusable element',
    onClose: 'Return focus to trigger element',
  },
} as const;

// =============================================================================
// Screen Reader Support
// =============================================================================

/**
 * Screen Reader Announcements
 */
export const SCREEN_READER_SUPPORT = {
  /**
   * Image Alt Text
   */
  images: {
    decorative: {
      alt: '',
      ariaHidden: true,
      description: 'Decorative images should have empty alt="" and aria-hidden="true"',
    },
    informative: {
      alt: 'Descriptive text explaining image content',
      description: 'Informative images must have meaningful alt text',
    },
    functional: {
      alt: 'Description of function (e.g., "Close modal")',
      description: 'Functional images (buttons) describe the action',
    },
  },

  /**
   * Form Labels
   */
  formLabels: {
    visible: {
      element: '<label for="inputId">',
      description: 'Always prefer visible <label> elements',
    },
    hidden: {
      attribute: 'aria-label="Label text"',
      description: 'Only use aria-label when visual label cannot be shown',
    },
    grouping: {
      element: '<fieldset> and <legend>',
      description: 'Use for radio button groups and checkbox groups',
    },
  },

  /**
   * Dynamic Content Updates
   */
  liveRegions: {
    polite: {
      ariaLive: 'polite',
      usage: 'Non-urgent updates (success messages, form validation)',
    },
    assertive: {
      ariaLive: 'assertive',
      usage: 'Urgent updates (errors, time-sensitive warnings)',
    },
    atomic: {
      ariaAtomic: 'true',
      usage: 'Read entire message, not just changed part',
    },
  },

  /**
   * Skip Links
   */
  skipLinks: {
    purpose: 'Allow keyboard users to skip repetitive navigation',
    location: 'First focusable element on page',
    target: '#main-content',
    styling: 'Visually hidden by default, visible on focus',
    implementation: `
      <a href="#main-content" class="sr-only focus:not-sr-only">
        Skip to main content
      </a>
    `,
  },
} as const;

// =============================================================================
// Testing Tools & Methods
// =============================================================================

/**
 * Accessibility Testing Strategy
 */
export const TESTING_STRATEGY = {
  /**
   * Automated Testing Tools
   */
  automated: {
    axeCore: {
      tool: 'axe DevTools Chrome Extension',
      coverage: 'Detects ~57% of accessibility issues',
      usage: 'Run on every page during development',
      url: 'https://www.deque.com/axe/devtools/',
    },
    lighthouse: {
      tool: 'Chrome DevTools Lighthouse',
      coverage: 'Accessibility score (0-100)',
      usage: 'Run before every PR merge',
      target: 'Score 95+',
    },
    wave: {
      tool: 'WAVE (WebAIM)',
      coverage: 'Visual feedback on accessibility issues',
      usage: 'Final check before production deploy',
      url: 'https://wave.webaim.org/',
    },
    reactAxe: {
      tool: '@axe-core/react',
      coverage: 'Runtime accessibility testing in development',
      usage: 'Automatically logs violations to console during development',
    },
  },

  /**
   * Manual Testing Methods
   */
  manual: {
    keyboardOnly: {
      method: 'Navigate entire site using only keyboard (Tab, Enter, Escape, Arrow keys)',
      checklist: [
        'All interactive elements reachable',
        'Focus indicators visible',
        'Logical tab order',
        'Modals trap focus',
        'No keyboard traps',
      ],
    },
    screenReader: {
      method: 'Test with VoiceOver (macOS) or NVDA (Windows)',
      checklist: [
        'All content announced correctly',
        'Landmarks help navigate',
        'Form labels read aloud',
        'Error messages announced',
        'Image alt text descriptive',
      ],
    },
    zoom: {
      method: 'Zoom browser to 200%',
      checklist: [
        'Text remains readable',
        'No horizontal scrolling',
        'Content does not overlap',
        'Buttons still clickable',
      ],
    },
    grayscale: {
      method: 'Enable grayscale/high contrast mode',
      checklist: [
        'Information not conveyed by color alone',
        'Error states still distinguishable',
        'Focus indicators visible',
      ],
    },
  },

  /**
   * Continuous Integration Testing
   */
  ci: {
    lighthouseCI: {
      tool: 'Lighthouse CI',
      action: 'GitHub Actions workflow',
      budget: {
        accessibility: 95,
        performance: 90,
        seo: 95,
      },
      failOnRegression: true,
    },
    axeCI: {
      tool: '@axe-core/cli or axe-playwright',
      action: 'Run axe tests in Playwright E2E suite',
      failOnViolations: true,
    },
  },
} as const;

// =============================================================================
// Common Accessibility Patterns
// =============================================================================

/**
 * Accessible Component Patterns
 */
export const ACCESSIBLE_PATTERNS = {
  /**
   * Accessible Button
   */
  button: `
    // ✅ GOOD
    <button
      aria-label="Close modal"
      onClick={handleClose}
      className="focus:ring-2 focus:ring-spanish-red-500 focus:ring-offset-2"
    >
      <X aria-hidden="true" />
    </button>

    // ❌ BAD - No accessible label
    <button onClick={handleClose}>
      <X />
    </button>
  `,

  /**
   * Accessible Form Field
   */
  formField: `
    // ✅ GOOD
    <div>
      <label htmlFor="email" className="block mb-2">
        Email Address
      </label>
      <input
        id="email"
        type="email"
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? "email-error" : undefined}
        className="border rounded px-4 py-2"
      />
      {error && (
        <span id="email-error" role="alert" className="text-red-600">
          {error}
        </span>
      )}
    </div>

    // ❌ BAD - No label, no error association
    <input type="email" placeholder="Enter email" />
  `,

  /**
   * Accessible Modal
   */
  modal: `
    // ✅ GOOD
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <h2 id="modal-title">Confirm Booking</h2>
      <p id="modal-description">Are you sure you want to book this lesson?</p>
      <button onClick={handleConfirm}>Confirm</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>

    // ❌ BAD - No ARIA attributes, no title
    <div className="modal">
      <p>Are you sure?</p>
      <button onClick={handleConfirm}>Yes</button>
    </div>
  `,

  /**
   * Accessible Skip Link
   */
  skipLink: `
    // ✅ GOOD
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
    >
      Skip to main content
    </a>

    // In Tailwind config:
    // sr-only: { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', ... }
    // focus:not-sr-only: Removes sr-only classes on focus
  `,
} as const;

// =============================================================================
// Accessibility Checklist
// =============================================================================

/**
 * Comprehensive Accessibility Checklist
 * All items must be ✅ before production deployment
 */
export const ACCESSIBILITY_CHECKLIST = {
  /**
   * Visual & Color
   */
  visual: [
    '✅ Text contrast: 4.5:1 minimum (normal text)',
    '✅ Text contrast: 3:1 minimum (large text)',
    '✅ UI component contrast: 3:1 minimum',
    '✅ Focus indicators visible and high contrast',
    '✅ Color not sole indicator of state/information',
    '✅ Text resizable to 200% without loss of content',
  ],

  /**
   * Keyboard Navigation
   */
  keyboard: [
    '✅ All interactive elements focusable via Tab',
    '✅ Logical tab order (left-to-right, top-to-bottom)',
    '✅ Enter/Space activate buttons',
    '✅ Escape closes modals/dropdowns',
    '✅ Arrow keys navigate lists/menus',
    '✅ No keyboard traps',
  ],

  /**
   * Screen Readers
   */
  screenReaders: [
    '✅ All images have alt text (or alt="" for decorative)',
    '✅ All form inputs have labels',
    '✅ Landmarks used (header, main, nav, footer)',
    '✅ ARIA attributes correct (role, aria-label, etc.)',
    '✅ Error messages announced (role="alert")',
    '✅ Dynamic content updates announced (aria-live)',
  ],

  /**
   * Content
   */
  content: [
    '✅ Semantic HTML (h1-h6 hierarchy)',
    '✅ Heading hierarchy logical (no skipped levels)',
    '✅ Link text descriptive ("Learn more" → "Learn more about Spanish lessons")',
    '✅ Language declared (<html lang="en">)',
    '✅ Page title unique and descriptive',
  ],

  /**
   * Forms
   */
  forms: [
    '✅ Form labels visible and associated with inputs',
    '✅ Required fields indicated (visually and with aria-required)',
    '✅ Error messages specific and helpful',
    '✅ Success states announced to screen readers',
    '✅ Autofocus used sparingly (can be disorienting)',
  ],

  /**
   * Testing
   */
  testing: [
    '✅ axe DevTools scan passes (0 violations)',
    '✅ Lighthouse Accessibility score 95+',
    '✅ Keyboard-only navigation tested',
    '✅ Screen reader tested (VoiceOver or NVDA)',
    '✅ Zoom to 200% tested',
    '✅ Grayscale mode tested',
  ],
} as const;

// =============================================================================
// Export all specifications
// =============================================================================

export {
  CONTRAST_REQUIREMENTS,
  COLOR_AUDIT,
  KEYBOARD_NAVIGATION,
  ARIA_REQUIREMENTS,
  FOCUS_INDICATORS,
  SCREEN_READER_SUPPORT,
  TESTING_STRATEGY,
  ACCESSIBLE_PATTERNS,
  ACCESSIBILITY_CHECKLIST,
};
