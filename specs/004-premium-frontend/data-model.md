# Data Model: Premium Frontend Design System

**Feature**: 004-premium-frontend
**Date**: 2026-02-15

## Overview

This document defines the structure of the design system for the premium frontend redesign. Unlike backend data models with entities and relationships, this defines **design tokens**, **component hierarchies**, and **theme structures** that govern the visual system.

---

## 1. Design Tokens

Design tokens are the atomic building blocks of the design system - the single source of truth for colors, typography, spacing, etc.

### 1.1 Color Tokens

```typescript
interface ColorScale {
  50: string;  // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base
  600: string;
  700: string;
  800: string;
  900: string; // Darkest
}

interface ColorSystem {
  brand: {
    spanishRed: ColorScale;     // Primary brand color
    gold: ColorScale;            // Secondary brand color
    terracotta: ColorScale;      // Cultural accent
  };
  semantic: {
    primary: string;    // spanishRed-600
    secondary: string;  // gold-600
    success: string;    // green-600
    danger: string;     // red-600
    warning: string;    // gold-500
    info: string;       // blue-600
  };
  neutral: {
    clay: ColorScale;  // Warm neutral (50-900)
  };
  functional: {
    background: string;   // clay-50
    surface: string;      // white
    border: string;       // clay-200
    textPrimary: string;  // clay-900
    textSecondary: string; // clay-600
    textMuted: string;    // clay-400
  };
}
```

**Values (from research.md):**
- Spanish Red: #B91C1C (base 600) - 5.6:1 contrast on white ✅
- Gold: #D97706 (base 600) - 4.7:1 contrast on white ✅
- Clay Neutral: #E8DED0 (base 200) - warm, Spanish-inspired neutral

### 1.2 Typography Tokens

```typescript
interface TypographySystem {
  families: {
    sans: string;    // Inter (body, UI elements)
    serif: string;   // Playfair Display (headings)
    mono: string;    // Fira Code (code snippets, if needed)
  };
  sizes: {
    xs: string;      // 0.75rem (12px)
    sm: string;      // 0.875rem (14px)
    base: string;    // 1rem (16px)
    lg: string;      // 1.125rem (18px)
    xl: string;      // 1.25rem (20px)
    '2xl': string;   // 1.5rem (24px)
    '3xl': string;   // 1.875rem (30px)
    '4xl': string;   // 2.25rem (36px)
    '5xl': string;   // 3rem (48px)
    '6xl': string;   // 3.75rem (60px)
  };
  weights: {
    normal: number;    // 400
    medium: number;    // 500
    semibold: number;  // 600
    bold: number;      // 700
  };
  lineHeights: {
    tight: number;    // 1.25
    snug: number;     // 1.375
    normal: number;   // 1.5
    relaxed: number;  // 1.625
    loose: number;    // 2
  };
  letterSpacing: {
    tighter: string;  // -0.05em
    tight: string;    // -0.025em
    normal: string;   // 0
    wide: string;     // 0.025em
    wider: string;    // 0.05em
  };
}
```

**Fluid Typography (Responsive):**
```typescript
interface FluidTypography {
  'fluid-sm': string;   // clamp(0.875rem, 0.8rem + 0.3125vw, 1rem)
  'fluid-base': string; // clamp(1rem, 0.9rem + 0.4167vw, 1.25rem)
  'fluid-lg': string;   // clamp(1.125rem, 1rem + 0.5208vw, 1.5rem)
  'fluid-xl': string;   // clamp(1.25rem, 1.05rem + 0.8333vw, 1.875rem)
  'fluid-2xl': string;  // clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem)
  'fluid-3xl': string;  // clamp(1.875rem, 1.35rem + 2.1875vw, 3rem)
}
```

### 1.3 Spacing Tokens (8px Base Unit)

```typescript
interface SpacingSystem {
  0: string;    // 0
  1: string;    // 0.25rem (4px)
  2: string;    // 0.5rem (8px)
  3: string;    // 0.75rem (12px)
  4: string;    // 1rem (16px)
  5: string;    // 1.25rem (20px)
  6: string;    // 1.5rem (24px)
  8: string;    // 2rem (32px)
  10: string;   // 2.5rem (40px)
  12: string;   // 3rem (48px)
  16: string;   // 4rem (64px)
  20: string;   // 5rem (80px)
  24: string;   // 6rem (96px)
  32: string;   // 8rem (128px)
  40: string;   // 10rem (160px)
  48: string;   // 12rem (192px)
  56: string;   // 14rem (224px)
  64: string;   // 16rem (256px)
}
```

**Usage:**
- Internal component padding: 4, 6, 8
- Card/section spacing: 6, 8, 12
- Page section gaps: 16, 20, 24
- Hero section padding: 32, 40, 48

### 1.4 Border Radius Tokens

```typescript
interface BorderRadiusSystem {
  none: string;    // 0
  sm: string;      // 0.125rem (2px)
  DEFAULT: string; // 0.25rem (4px)
  md: string;      // 0.375rem (6px)
  lg: string;      // 0.5rem (8px)
  xl: string;      // 0.75rem (12px)
  '2xl': string;   // 1rem (16px)
  '3xl': string;   // 1.5rem (24px)
  full: string;    // 9999px
}
```

**Usage:**
- Buttons: lg (8px)
- Cards: xl (12px)
- Modals: 2xl (16px)
- Avatars: full (circle)

### 1.5 Shadow Tokens (Elevation)

```typescript
interface ShadowSystem {
  sm: string;     // 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  DEFAULT: string; // 0 1px 3px 0 rgba(0, 0, 0, 0.1)
  md: string;     // 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  lg: string;     // 0 10px 15px -3px rgba(0, 0, 0, 0.1)
  xl: string;     // 0 20px 25px -5px rgba(0, 0, 0, 0.1)
  '2xl': string;  // 0 25px 50px -12px rgba(0, 0, 0, 0.25)
  glowSpanish: string;  // 0 0 20px rgba(185, 28, 28, 0.3)
  glowGold: string;     // 0 0 20px rgba(217, 119, 6, 0.3)
}
```

**Usage:**
- Flat cards: sm
- Raised cards: md
- Modals/dropdowns: lg
- Hero cards: xl
- Hover states: glow effects

### 1.6 Animation Tokens

```typescript
interface AnimationSystem {
  duration: {
    fast: string;     // 150ms
    normal: string;   // 200ms
    slow: string;     // 300ms
    slower: string;   // 500ms
  };
  easing: {
    in: string;       // cubic-bezier(0.4, 0, 1, 1)
    out: string;      // cubic-bezier(0, 0, 0.2, 1)
    inOut: string;    // cubic-bezier(0.4, 0, 0.2, 1)
  };
  keyframes: {
    fadeIn: object;
    fadeInUp: object;
    slideInRight: object;
    scaleIn: object;
    shimmer: object;
    pulseSoft: object;
  };
}
```

**Usage:**
- Button hovers: duration-fast + ease-out
- Page transitions: duration-normal + ease-inOut
- Skeleton loading: shimmer animation

---

## 2. Component Hierarchy

Components organized by atomic design principles:

### 2.1 Atomic Components (Primitives)

**Button:**
```typescript
interface ButtonVariant {
  component: 'Button';
  variants: {
    primary: 'Spanish red gradient with white text';
    secondary: 'Gold gradient with dark text';
    outline: 'Transparent with border';
    ghost: 'Transparent with hover';
    destructive: 'Red with white text';
  };
  sizes: {
    sm: 'h-9 px-4 text-xs';
    md: 'h-11 px-6 text-sm';
    lg: 'h-12 px-8 text-base';
    xl: 'h-14 px-10 text-lg';
  };
  states: ['default', 'hover', 'active', 'disabled', 'loading'];
}
```

**Input:**
```typescript
interface InputVariant {
  component: 'Input';
  variants: {
    default: 'Border with focus ring';
    filled: 'Background color with border';
    flushed: 'Bottom border only';
  };
  sizes: {
    sm: 'h-9 px-3 text-sm';
    md: 'h-11 px-4 text-base';
    lg: 'h-12 px-4 text-base';
  };
  states: ['default', 'focus', 'error', 'disabled', 'success'];
}
```

**Badge:**
```typescript
interface BadgeVariant {
  component: 'Badge';
  variants: {
    primary: 'Spanish red background';
    secondary: 'Gold background';
    success: 'Green background';
    warning: 'Gold background';
    danger: 'Red background';
    neutral: 'Gray background';
  };
  sizes: {
    sm: 'px-2 py-0.5 text-xs';
    md: 'px-2.5 py-0.5 text-sm';
    lg: 'px-3 py-1 text-base';
  };
}
```

**Avatar:**
```typescript
interface AvatarVariant {
  component: 'Avatar';
  sizes: {
    xs: 'h-6 w-6';
    sm: 'h-8 w-8';
    md: 'h-10 w-10';
    lg: 'h-12 w-12';
    xl: 'h-16 w-16';
    '2xl': 'h-24 w-24';
  };
  variants: {
    circle: 'rounded-full';
    square: 'rounded-lg';
  };
}
```

### 2.2 Molecular Components (Combinations)

**Card:**
```typescript
interface CardVariant {
  component: 'Card';
  variants: {
    default: 'White background with shadow';
    outlined: 'White background with border';
    elevated: 'White background with large shadow';
    glass: 'Translucent with backdrop blur';
  };
  structure: {
    CardHeader: 'Title + optional description';
    CardContent: 'Main content area';
    CardFooter: 'Actions or metadata';
  };
}
```

**FormField:**
```typescript
interface FormFieldVariant {
  component: 'FormField';
  structure: {
    Label: 'Accessible label with htmlFor';
    Input: 'Input component';
    HelperText: 'Optional hint text';
    ErrorMessage: 'Validation error (role="alert")';
  };
  states: ['idle', 'focus', 'error', 'success', 'disabled'];
}
```

**SearchBar:**
```typescript
interface SearchBarVariant {
  component: 'SearchBar';
  variants: {
    default: 'Input with search icon';
    withFilters: 'Input with dropdown filters';
    withSuggestions: 'Input with autocomplete';
  };
  features: ['debounced input', 'clear button', 'keyboard navigation'];
}
```

### 2.3 Organism Components (Complex)

**Header:**
```typescript
interface HeaderVariant {
  component: 'Header';
  variants: {
    default: 'Logo + Navigation + Actions';
    transparent: 'Transparent background (hero overlay)';
    sticky: 'Fixed position on scroll';
  };
  responsiveStates: {
    mobile: 'Hamburger menu + logo + user avatar';
    desktop: 'Full horizontal navigation';
  };
}
```

**Footer:**
```typescript
interface FooterVariant {
  component: 'Footer';
  structure: {
    links: 'Organized link groups';
    social: 'Social media icons';
    legal: 'Copyright + privacy policy';
    newsletter: 'Email signup form';
  };
  responsiveStates: {
    mobile: 'Stacked sections';
    desktop: '4-column grid';
  };
}
```

**BookingCard:**
```typescript
interface BookingCardVariant {
  component: 'BookingCard';
  structure: {
    TeacherPhoto: 'Avatar with status indicator';
    TeacherInfo: 'Name + rating + badge';
    LessonDetails: 'Type + duration + description';
    Pricing: 'Price + currency + per-hour indicator';
    CTA: 'Book Now button';
  };
  states: ['available', 'pending', 'booked', 'unavailable'];
}
```

### 2.4 Template Components (Page Layouts)

**AuthPageTemplate:**
```typescript
interface AuthPageTemplate {
  component: 'AuthPageTemplate';
  layout: {
    leftPanel: 'Branding + illustration';
    rightPanel: 'Auth form (login/register)';
  };
  responsiveStates: {
    mobile: 'Single column (form only)';
    desktop: 'Two-column split (50/50)';
  };
}
```

**DashboardTemplate:**
```typescript
interface DashboardTemplate {
  component: 'DashboardTemplate';
  layout: {
    sidebar: 'Navigation (collapsible on mobile)';
    header: 'User info + notifications';
    main: 'Dashboard content';
  };
  responsiveStates: {
    mobile: 'Bottom navigation + full-width main';
    desktop: 'Left sidebar + main content';
  };
}
```

**LandingPageTemplate:**
```typescript
interface LandingPageTemplate {
  component: 'LandingPageTemplate';
  sections: {
    hero: 'Headline + CTA + hero image';
    features: 'Bento grid of feature cards';
    testimonials: 'Student reviews carousel';
    cta: 'Final call-to-action section';
  };
}
```

---

## 3. Theme Structure

### 3.1 Light Mode (Primary Theme)

```typescript
interface LightTheme {
  name: 'light';
  colors: {
    background: 'clay-50';
    surface: 'white';
    primary: 'spanishRed-600';
    secondary: 'gold-600';
    text: 'clay-900';
    textSecondary: 'clay-600';
    border: 'clay-200';
  };
  shadows: 'Full shadow system';
  contrast: 'WCAG AA compliant';
}
```

### 3.2 Dark Mode (Future Scope)

```typescript
interface DarkTheme {
  name: 'dark';
  colors: {
    background: 'clay-900';
    surface: 'clay-800';
    primary: 'spanishRed-400';  // Lighter for dark backgrounds
    secondary: 'gold-400';
    text: 'clay-50';
    textSecondary: 'clay-300';
    border: 'clay-700';
  };
  shadows: 'Adjusted shadow opacity for dark backgrounds';
  contrast: 'WCAG AA compliant on dark surfaces';
}
```

**Note:** Dark mode is future scope, but structure documented for eventual implementation.

### 3.3 High Contrast Mode (Accessibility)

```typescript
interface HighContrastTheme {
  name: 'highContrast';
  colors: {
    background: 'pure white (#FFFFFF)';
    surface: 'pure white (#FFFFFF)';
    primary: 'spanishRed-700';  // Darker for AAA contrast
    secondary: 'gold-700';
    text: 'pure black (#000000)';
    textSecondary: 'clay-800';
    border: 'pure black (#000000)';
  };
  shadows: 'Stronger, higher contrast shadows';
  contrast: 'WCAG AAA compliant (7:1 minimum)';
}
```

### 3.4 Reduced Motion Mode (Accessibility)

```typescript
interface ReducedMotionTheme {
  animations: {
    duration: 'All set to 0ms';
    transitions: 'Disabled except essential (focus indicators)';
  };
  applyWhen: '@media (prefers-reduced-motion: reduce)';
}
```

---

## 4. Breakpoint Rules

```typescript
interface BreakpointSystem {
  xs: {
    minWidth: '320px';
    maxWidth: '639px';
    usage: 'Small phones (iPhone SE)';
  };
  sm: {
    minWidth: '640px';
    maxWidth: '767px';
    usage: 'Large phones (iPhone 12/13/14)';
  };
  md: {
    minWidth: '768px';
    maxWidth: '1023px';
    usage: 'Tablets (iPad)';
  };
  lg: {
    minWidth: '1024px';
    maxWidth: '1279px';
    usage: 'Laptops (MacBook Air)';
  };
  xl: {
    minWidth: '1280px';
    maxWidth: '1535px';
    usage: 'Desktops';
  };
  '2xl': {
    minWidth: '1536px';
    maxWidth: 'none';
    usage: 'Large desktops (4K monitors)';
  };
}
```

**Mobile-First Approach:**
- Base styles apply to all screen sizes
- Use `md:`, `lg:`, `xl:` prefixes to override for larger screens
- Example: `text-base md:text-lg lg:text-xl`

---

## 5. Design Token Schema (JSON)

For tooling and design-to-code workflows:

```json
{
  "colors": {
    "brand": {
      "spanishRed": {
        "600": {
          "value": "#B91C1C",
          "contrast": "5.6:1",
          "wcag": "AA",
          "usage": "Primary CTA buttons, links, important actions"
        }
      },
      "gold": {
        "600": {
          "value": "#D97706",
          "contrast": "4.7:1",
          "wcag": "AA",
          "usage": "Secondary actions, premium highlights, success states"
        }
      }
    }
  },
  "typography": {
    "families": {
      "sans": {
        "value": "Inter, system-ui, sans-serif",
        "usage": "Body text, UI components, navigation"
      },
      "serif": {
        "value": "Playfair Display, Georgia, serif",
        "usage": "Headings only (Spanish baroque influence)"
      }
    },
    "sizes": {
      "fluid-2xl": {
        "value": "clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem)",
        "usage": "Page headings (H1)"
      }
    }
  },
  "spacing": {
    "6": {
      "value": "1.5rem",
      "pixels": "24px",
      "usage": "Card internal padding, section gaps"
    }
  }
}
```

This schema can be consumed by design tools (Figma plugins), style dictionary, or documentation generators.

---

## 6. Component State Model

All interactive components follow this state model:

```typescript
interface ComponentState {
  default: 'Initial state';
  hover: 'Mouse pointer over element';
  focus: 'Keyboard navigation focus';
  active: 'Click/touch in progress';
  disabled: 'Non-interactive, visually muted';
  loading: 'Async operation in progress';
  error: 'Validation failed or operation error';
  success: 'Operation completed successfully';
}
```

**State Priority (when multiple states apply):**
1. Disabled (overrides all)
2. Loading (overrides error/success)
3. Error (overrides success)
4. Success
5. Active
6. Focus
7. Hover
8. Default

---

## Implementation Notes

1. **Design tokens** live in `/packages/frontend/tailwind.config.js` and `/packages/frontend/src/lib/design-tokens.ts`
2. **Component hierarchy** guides file organization in `/packages/frontend/src/components/`
3. **Theme structure** implemented via CSS variables in `/packages/frontend/src/styles/globals.css`
4. **Breakpoint rules** use Tailwind's built-in responsive prefixes
5. **Component states** handled via className conditional logic and Radix UI state props

All design decisions in this document are informed by research.md findings and optimized for accessibility, performance, and Spanish cultural authenticity.
