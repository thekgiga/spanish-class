/**
 * Component API Contracts
 *
 * Type-safe prop interfaces for all redesigned components.
 * These contracts ensure consistency across the design system.
 */

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// =============================================================================
// Atomic Components
// =============================================================================

/**
 * Button Component
 * Enhanced with Spanish-inspired variants and accessibility features
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * - primary: Spanish red gradient (main CTAs)
   * - secondary: Gold gradient (secondary actions)
   * - outline: Transparent with border (tertiary actions)
   * - ghost: Minimal styling (inline actions)
   * - destructive: Red for dangerous actions
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

  /**
   * Size variants following 8px spacing system
   * - sm: 36px height (9 * 4px)
   * - md: 44px height (11 * 4px) - meets touch target requirement
   * - lg: 48px height (12 * 4px)
   * - xl: 56px height (14 * 4px)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Disabled state (visually muted, non-interactive)
   */
  disabled?: boolean;

  /**
   * Loading state (shows spinner, prevents interaction)
   */
  loading?: boolean;

  /**
   * Optional icon (Lucide React icon component)
   */
  icon?: ReactNode;

  /**
   * Full width button (useful for mobile CTAs)
   */
  fullWidth?: boolean;

  /**
   * Accessibility: Custom ARIA label
   * Required when button contains only an icon
   */
  ariaLabel?: string;

  /**
   * Accessibility: ARIA described-by ID
   * Links button to helper/error text
   */
  ariaDescribedBy?: string;

  /**
   * Button content
   */
  children: ReactNode;
}

/**
 * Input Component
 * Form input with validation states and accessibility
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual variant
   * - default: Standard border with focus ring
   * - filled: Background color with border
   * - flushed: Bottom border only (minimal style)
   */
  variant?: 'default' | 'filled' | 'flushed';

  /**
   * Size variants
   * - sm: 36px height
   * - md: 44px height (default, meets touch target)
   * - lg: 48px height
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Error state (shows error styling, red border)
   */
  error?: boolean;

  /**
   * Success state (shows success styling, green border)
   */
  success?: boolean;

  /**
   * Helper text (displayed below input)
   */
  helperText?: string;

  /**
   * Error message (displayed below input with role="alert")
   */
  errorMessage?: string;

  /**
   * Accessibility: Label text
   * Required for screen readers
   */
  label?: string;

  /**
   * Accessibility: Required field indicator
   */
  required?: boolean;
}

/**
 * Badge Component
 * Status indicator or label
 */
export interface BadgeProps {
  /**
   * Visual variant
   * - primary: Spanish red background
   * - secondary: Gold background
   * - success: Green background
   * - warning: Gold background
   * - danger: Red background
   * - neutral: Gray background
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';

  /**
   * Size variants
   * - sm: 4px padding, xs text
   * - md: 6px padding, sm text (default)
   * - lg: 8px padding, base text
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Badge content (text or number)
   */
  children: ReactNode;
}

/**
 * Avatar Component
 * User profile picture or initials
 */
export interface AvatarProps {
  /**
   * Image source URL
   */
  src?: string;

  /**
   * Alt text for image (accessibility)
   */
  alt: string;

  /**
   * Fallback initials (shown if image fails to load)
   */
  fallback?: string;

  /**
   * Size variants
   * - xs: 24px (6 * 4px)
   * - sm: 32px (8 * 4px)
   * - md: 40px (10 * 4px) - default
   * - lg: 48px (12 * 4px)
   * - xl: 64px (16 * 4px)
   * - 2xl: 96px (24 * 4px)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * Shape variant
   * - circle: Fully rounded (default)
   * - square: Rounded corners (lg radius)
   */
  variant?: 'circle' | 'square';

  /**
   * Status indicator (online, busy, offline)
   */
  status?: 'online' | 'busy' | 'offline';
}

// =============================================================================
// Molecular Components
// =============================================================================

/**
 * Card Component
 * Container for related content
 */
export interface CardProps {
  /**
   * Visual variant
   * - default: White background with shadow
   * - outlined: White background with border only
   * - elevated: White background with large shadow
   * - glass: Translucent with backdrop blur (glassmorphism)
   */
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';

  /**
   * Interactive card (shows hover state)
   */
  interactive?: boolean;

  /**
   * Click handler (makes card clickable)
   */
  onClick?: () => void;

  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Card Header Component
 * Title and description section of card
 */
export interface CardHeaderProps {
  /**
   * Card title (H3 by default)
   */
  title: string;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Optional action button (e.g., Edit, Delete)
   */
  action?: ReactNode;

  /**
   * Additional content
   */
  children?: ReactNode;
}

/**
 * Form Field Component
 * Complete form field with label, input, helper text, and error message
 */
export interface FormFieldProps {
  /**
   * Unique ID for the input (links label and input)
   */
  id: string;

  /**
   * Label text
   */
  label: string;

  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date';

  /**
   * Input value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Required field indicator
   */
  required?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Helper text (shown below input)
   */
  helperText?: string;

  /**
   * Error message (shown below input with alert role)
   */
  error?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;
}

// =============================================================================
// Organism Components
// =============================================================================

/**
 * Header Component
 * Main navigation header
 */
export interface HeaderProps {
  /**
   * Visual variant
   * - default: Solid background
   * - transparent: Transparent background (for hero overlays)
   * - sticky: Fixed position on scroll
   */
  variant?: 'default' | 'transparent' | 'sticky';

  /**
   * Logo component or text
   */
  logo?: ReactNode;

  /**
   * Navigation links
   */
  navItems?: NavItem[];

  /**
   * Right-side action buttons (e.g., Login, Sign Up)
   */
  actions?: ReactNode;

  /**
   * User menu (avatar + dropdown)
   */
  userMenu?: ReactNode;
}

/**
 * Navigation Item
 */
export interface NavItem {
  /**
   * Display text
   */
  label: string;

  /**
   * Link href
   */
  href: string;

  /**
   * Active state (current page)
   */
  active?: boolean;

  /**
   * Optional icon
   */
  icon?: ReactNode;
}

/**
 * Booking Card Component
 * Displays teacher info, lesson details, pricing, and booking CTA
 */
export interface BookingCardProps {
  /**
   * Teacher information
   */
  teacher: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
    totalReviews: number;
    badge?: string; // e.g., "Certified", "Top Rated"
  };

  /**
   * Lesson details
   */
  lesson: {
    id: string;
    type: string; // e.g., "Conversation", "Grammar", "DELE Prep"
    duration: number; // in minutes
    description?: string;
  };

  /**
   * Pricing information
   */
  pricing: {
    amount: number;
    currency: string; // "RSD"
    perUnit: string; // "per hour", "per lesson"
  };

  /**
   * Availability status
   * - available: Can be booked
   * - pending: Awaiting confirmation
   * - booked: Already booked
   * - unavailable: Not available
   */
  status: 'available' | 'pending' | 'booked' | 'unavailable';

  /**
   * Click handler for booking button
   */
  onBook?: () => void;

  /**
   * Click handler for viewing teacher details
   */
  onViewTeacher?: () => void;
}

// =============================================================================
// Accessibility Contracts
// =============================================================================

/**
 * Keyboard Navigation Pattern
 * Standard keyboard interactions for components
 */
export interface KeyboardNavigationPattern {
  /**
   * Tab: Move focus to next interactive element
   */
  Tab: 'Focus next element';

  /**
   * Shift + Tab: Move focus to previous interactive element
   */
  'Shift+Tab': 'Focus previous element';

  /**
   * Enter: Activate button/link
   */
  Enter: 'Activate element';

  /**
   * Space: Activate button, toggle checkbox
   */
  Space: 'Activate/toggle element';

  /**
   * Escape: Close modal/dropdown
   */
  Escape?: 'Close overlay';

  /**
   * Arrow Up/Down: Navigate list items
   */
  'ArrowUp/ArrowDown'?: 'Navigate list';

  /**
   * Arrow Left/Right: Navigate tabs/carousel
   */
  'ArrowLeft/ArrowRight'?: 'Navigate horizontal items';
}

/**
 * ARIA Attributes Contract
 * Required ARIA attributes for accessibility
 */
export interface ARIAAttributesContract {
  /**
   * Button-specific ARIA attributes
   */
  button: {
    'aria-label'?: string;
    'aria-pressed'?: boolean;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
    'aria-describedby'?: string;
  };

  /**
   * Input-specific ARIA attributes
   */
  input: {
    'aria-label'?: string;
    'aria-required'?: boolean;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
  };

  /**
   * Modal-specific ARIA attributes
   */
  modal: {
    role: 'dialog';
    'aria-modal': true;
    'aria-labelledby': string;
    'aria-describedby'?: string;
  };

  /**
   * Navigation-specific ARIA attributes
   */
  nav: {
    role: 'navigation';
    'aria-label': string;
    'aria-current'?: 'page';
  };
}

/**
 * Focus Management Contract
 * Rules for managing focus in interactive components
 */
export interface FocusManagementContract {
  /**
   * Modal opens: Focus first interactive element
   */
  modalOpen: 'Focus first focusable element (Close button or first input)';

  /**
   * Modal closes: Return focus to trigger element
   */
  modalClose: 'Return focus to element that opened modal';

  /**
   * Dropdown opens: Focus first item
   */
  dropdownOpen: 'Focus first menu item';

  /**
   * Form submission error: Focus first invalid field
   */
  formError: 'Focus first field with error';

  /**
   * Page load: Focus skip link (for keyboard users)
   */
  pageLoad: 'Focus skip-to-content link';
}

// =============================================================================
// Export all contracts
// =============================================================================

export type {
  ButtonProps,
  InputProps,
  BadgeProps,
  AvatarProps,
  CardProps,
  CardHeaderProps,
  FormFieldProps,
  HeaderProps,
  NavItem,
  BookingCardProps,
  KeyboardNavigationPattern,
  ARIAAttributesContract,
  FocusManagementContract,
};
