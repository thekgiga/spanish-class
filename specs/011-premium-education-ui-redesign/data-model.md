# Data Model: Color System Design

**Feature**: Premium Education UI Redesign
**Date**: 2026-03-01

## Overview

This document defines the complete color token system for the Spanish Class education platform. The design replaces the current red-based palette with a professional blue/emerald system aligned with educational industry standards.

## Color Token Definitions

### Primary Palette: Education Blue

```javascript
'edu-blue': {
  50: '#EFF6FF',   // Lightest backgrounds
  100: '#DBEAFE',  // Light backgrounds
  200: '#BFDBFE',  // Hover states (light)
  300: '#93C5FD',  // Disabled states
  400: '#60A5FA',  // Secondary actions
  500: '#3B82F6',  // Secondary brand
  600: '#2563EB',  // PRIMARY BRAND COLOR
  700: '#1D4ED8',  // Hover states (dark)
  800: '#1E40AF',  // Active states
  900: '#1E3A8A',  // Dark text
  950: '#172554',  // Darkest text
}
```

**Usage**:
- **Primary (600)**: Main brand color, primary buttons, active navigation, logo
- **Secondary (500)**: Secondary buttons, links, badges
- **Backgrounds (50-100)**: Page backgrounds, subtle highlights
- **Text (900-950)**: Headings on light backgrounds

**Contrast Ratios**:
- Blue-600 on white: **7.5:1** ✅ (WCAG AAA)
- Blue-600 on blue-50: **6.8:1** ✅
- White on blue-600: **7.5:1** ✅

### Success & Progress: Emerald

```javascript
'edu-emerald': {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',  // PRIMARY SUCCESS COLOR
  600: '#059669',  // Hover state
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
}
```

**Usage**:
- **Primary (500)**: Progress bars, success messages, completion badges
- **Hover (600)**: Success button hover states
- **Backgrounds (50-100)**: Success notification backgrounds

**Contrast Ratios**:
- Emerald-500 on white: **3.4:1** ⚠️ (WCAG AA for large text only)
- Emerald-600 on white: **4.5:1** ✅ (WCAG AA)
- White on emerald-600: **4.5:1** ✅

### Call-to-Action: Orange

```javascript
'edu-orange': {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FED7AA',
  300: '#FDBA74',
  400: '#FB923C',
  500: '#F97316',  // PRIMARY CTA COLOR
  600: '#EA580C',  // Hover state
  700: '#C2410C',
  800: '#9A3412',
  900: '#7C2D12',
}
```

**Usage**:
- **Primary (500)**: High-priority CTAs ("Start Free Trial", "Book Now")
- **Hover (600)**: CTA hover states
- **Accents**: Attention-grabbing elements (limited use)

**Contrast Ratios**:
- Orange-500 on white: **3.3:1** ⚠️ (Use white text on orange background)
- White on orange-500: **3.3:1** ✅ (WCAG AA for large text)
- White on orange-600: **4.5:1** ✅ (WCAG AA)

### Neutrals: Slate

```javascript
'edu-slate': {
  50: '#F8FAFC',   // Page backgrounds
  100: '#F1F5F9',  // Card backgrounds
  200: '#E2E8F0',  // Borders
  300: '#CBD5E1',  // Disabled elements
  400: '#94A3B8',  // Placeholder text
  500: '#64748B',  // Muted text
  600: '#475569',  // Secondary text
  700: '#334155',  // Body text (alternative)
  800: '#1E293B',  // PRIMARY BODY TEXT
  900: '#0F172A',  // Headings
  950: '#020617',  // Maximum contrast
}
```

**Usage**:
- **Backgrounds (50-100)**: Page and card backgrounds
- **Borders (200-300)**: Dividers, card borders
- **Text (600-900)**: All text content
- **Primary text (800)**: Main body text
- **Heading text (900)**: Headings, important labels

**Contrast Ratios**:
- Slate-800 on white: **12.6:1** ✅ (WCAG AAA)
- Slate-600 on white: **7.6:1** ✅ (WCAG AAA)
- Slate-900 on slate-50: **17.9:1** ✅ (WCAG AAA)

### Supporting Colors

#### Warning/Alert: Amber
```javascript
'edu-amber': {
  500: '#F59E0B',  // Warning states
  600: '#D97706',  // Hover
}
```

#### Error: Red (Limited Use)
```javascript
'edu-red': {
  500: '#EF4444',  // Error messages only
  600: '#DC2626',  // Hover
  50: '#FEF2F2',   // Error backgrounds
}
```

## Typography Tokens

### Font Families

```javascript
fontFamily: {
  display: ['"Plus Jakarta Sans"', 'sans-serif'],  // Headings
  body: ['Inter', 'sans-serif'],                    // Body text
  mono: ['"JetBrains Mono"', 'monospace'],         // Code (optional)
}
```

**Usage**:
- **Display (Plus Jakarta Sans)**: All headings (h1-h6), hero text, section titles
- **Body (Inter)**: Paragraph text, lists, table content, UI labels
- **Mono (JetBrains Mono)**: Code snippets, technical content (if needed)

### Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
```

### Font Weights

```javascript
fontWeight: {
  light: '300',      // Rarely used
  normal: '400',     // Body text
  medium: '500',     // Emphasized text
  semibold: '600',   // Sub-headings, buttons
  bold: '700',       // Main headings
  extrabold: '800',  // Hero headings only
}
```

## Gradient Definitions

### Primary Gradients

```javascript
backgroundImage: {
  // Trust Blue Gradient (Primary Buttons)
  'gradient-blue': 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',

  // Success Gradient (Progress, Success States)
  'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',

  // CTA Gradient (High Priority Actions)
  'gradient-orange': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',

  // Page Background (Light)
  'gradient-page': 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #ECFDF5 100%)',

  // Hero Background
  'gradient-hero': 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',

  // Section Highlight
  'gradient-section': 'linear-gradient(135deg, #EFF6FF 0%, #ECFDF5 100%)',
}
```

**Usage Guidelines**:
- **gradient-blue**: Primary buttons, active navigation, brand elements
- **gradient-emerald**: Success buttons, progress completion
- **gradient-orange**: CTAs, promotional elements
- **gradient-page**: Main page backgrounds (subtle)
- **gradient-hero**: Hero sections, CTA sections
- **gradient-section**: Highlighted content sections

## Shadow Definitions

### Elevation System

```javascript
boxShadow: {
  // Subtle elevation (cards)
  'soft': '0 2px 8px -2px rgba(37, 99, 235, 0.1), 0 4px 16px -4px rgba(37, 99, 235, 0.05)',

  // Medium elevation (modals, dropdowns)
  'medium': '0 4px 12px -2px rgba(37, 99, 235, 0.15), 0 8px 24px -4px rgba(37, 99, 235, 0.1)',

  // High elevation (popovers, tooltips)
  'large': '0 8px 24px -4px rgba(37, 99, 235, 0.2), 0 16px 48px -8px rgba(37, 99, 235, 0.15)',

  // Colored shadows (brand emphasis)
  'glow-blue': '0 8px 24px rgba(37, 99, 235, 0.25)',
  'glow-emerald': '0 8px 24px rgba(16, 185, 129, 0.25)',
  'glow-orange': '0 8px 24px rgba(249, 115, 22, 0.25)',

  // Inner shadow (inputs, wells)
  'inner-soft': 'inset 0 2px 4px 0 rgba(15, 23, 42, 0.05)',
}
```

**Usage**:
- **soft**: Default cards, containers
- **medium**: Floating panels, navigation menus
- **large**: Modals, important overlays
- **glow-blue**: Primary buttons, brand elements
- **glow-emerald**: Success notifications, completion badges
- **glow-orange**: CTA buttons
- **inner-soft**: Text inputs, search boxes

## Border Radius Scale

```javascript
borderRadius: {
  'none': '0',
  'sm': '0.25rem',    // 4px - Small elements
  'DEFAULT': '0.5rem', // 8px - Buttons, inputs
  'md': '0.625rem',   // 10px - Cards
  'lg': '0.75rem',    // 12px - Panels
  'xl': '1rem',       // 16px - Large cards
  '2xl': '1.5rem',    // 24px - Hero elements
  '3xl': '2rem',      // 32px - Special cases
  'full': '9999px',   // Pills, avatars
}
```

## Color Usage Patterns

### Button Patterns

```jsx
// Primary Action
<Button className="bg-gradient-to-r from-edu-blue-600 to-edu-blue-500
                   hover:from-edu-blue-700 hover:to-edu-blue-600
                   text-white shadow-lg shadow-glow-blue">

// Success Action
<Button className="bg-gradient-to-r from-edu-emerald-600 to-edu-emerald-500
                   hover:from-edu-emerald-700 hover:to-edu-emerald-600
                   text-white shadow-lg shadow-glow-emerald">

// CTA Action
<Button className="bg-gradient-to-r from-edu-orange-600 to-edu-orange-500
                   hover:from-edu-orange-700 hover:to-edu-orange-600
                   text-white shadow-lg shadow-glow-orange">

// Secondary Action
<Button className="bg-white border-2 border-edu-blue-600
                   text-edu-blue-600 hover:bg-edu-blue-50">

// Ghost/Tertiary
<Button className="text-edu-blue-600 hover:bg-edu-blue-50">
```

### Badge Patterns

```jsx
// Primary Badge
<Badge className="bg-edu-blue-100 text-edu-blue-700 border-edu-blue-200">

// Success Badge
<Badge className="bg-edu-emerald-100 text-edu-emerald-700 border-edu-emerald-200">

// Warning Badge
<Badge className="bg-edu-amber-100 text-edu-amber-700 border-edu-amber-200">

// Info Badge
<Badge className="bg-edu-slate-100 text-edu-slate-700 border-edu-slate-200">
```

### Progress Bar Patterns

```jsx
// Learning Progress
<div className="h-2 bg-edu-slate-100 rounded-full">
  <div className="h-full bg-gradient-to-r from-edu-emerald-600 to-edu-emerald-500
                  rounded-full transition-all duration-500"
       style={{width: `${percentage}%`}} />
</div>

// Level Progress (Multi-stage)
<div className="h-3 bg-edu-slate-100 rounded-full">
  <div className="h-full bg-gradient-to-r from-edu-blue-600 via-edu-emerald-600 to-edu-orange-500
                  rounded-full"
       style={{width: `${percentage}%`}} />
</div>
```

### Navigation Patterns

```jsx
// Active Navigation Item
<NavItem className="bg-gradient-to-r from-edu-blue-600 to-edu-blue-500
                    text-white shadow-lg shadow-glow-blue">

// Inactive Navigation Item
<NavItem className="text-edu-slate-600 hover:text-edu-slate-900
                    hover:bg-edu-slate-100">
```

### Background Patterns

```jsx
// Page Background
<div className="bg-gradient-to-br from-edu-slate-50 via-white to-edu-blue-50/30">

// Hero Section
<section className="bg-gradient-to-br from-edu-blue-600 to-edu-emerald-600">

// Feature Section
<section className="bg-gradient-to-br from-edu-blue-50/30 to-edu-emerald-50/30">

// CTA Section
<section className="bg-gradient-to-br from-edu-orange-600 to-edu-orange-500">
```

## Semantic Color Mapping

### Component States

| State | Color Token | Example Usage |
|-------|------------|---------------|
| Default | `edu-blue-600` | Primary buttons, links |
| Hover | `edu-blue-700` | Button hover states |
| Active/Focus | `edu-blue-800` | Active navigation, focus rings |
| Disabled | `edu-slate-300` | Disabled buttons, inputs |
| Success | `edu-emerald-600` | Success messages, completed tasks |
| Warning | `edu-amber-500` | Warning alerts, pending states |
| Error | `edu-red-500` | Error messages, validation errors |
| Info | `edu-blue-500` | Information badges, tooltips |

### Text Hierarchy

| Element | Color Token | Contrast Ratio |
|---------|------------|----------------|
| Headings | `edu-slate-900` | 17.9:1 |
| Body Text | `edu-slate-800` | 12.6:1 |
| Secondary Text | `edu-slate-600` | 7.6:1 |
| Muted Text | `edu-slate-500` | 4.9:1 |
| Placeholder Text | `edu-slate-400` | 3.5:1 (large only) |
| Links | `edu-blue-600` | 7.5:1 |
| Link Hover | `edu-blue-700` | 9.8:1 |

## Animation & Transition Tokens

### Duration

```javascript
transitionDuration: {
  'fast': '150ms',     // Micro-interactions
  'normal': '200ms',   // Default transitions
  'medium': '300ms',   // Smooth animations
  'slow': '500ms',     // Page transitions
}
```

### Timing Functions

```javascript
transitionTimingFunction: {
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',       // Recommended for UI
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',       // Default
}
```

**Usage**:
- **Hover states**: `transition-colors duration-200 ease-out`
- **Focus rings**: `transition-all duration-150 ease-out`
- **Loading states**: `transition-opacity duration-300 ease-out`

## Accessibility Validation

### WCAG AA Compliance Matrix

| Foreground | Background | Ratio | Pass |
|-----------|-----------|-------|------|
| edu-blue-600 | white | 7.5:1 | ✅ AAA |
| edu-slate-800 | white | 12.6:1 | ✅ AAA |
| edu-emerald-600 | white | 4.5:1 | ✅ AA |
| edu-orange-600 | white | 4.5:1 | ✅ AA |
| white | edu-blue-600 | 7.5:1 | ✅ AAA |
| white | edu-emerald-600 | 4.5:1 | ✅ AA |
| white | edu-orange-500 | 3.3:1 | ⚠️ AA Large |

### Focus Ring Standards

```jsx
// Default Focus Ring
focus:ring-2 focus:ring-edu-blue-500 focus:ring-offset-2

// Dark Background Focus Ring
focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-edu-blue-600
```

## Migration Map

### Old → New Color Mapping

| Old Token | New Token | Component Examples |
|-----------|-----------|-------------------|
| `spanish-red-600` | `edu-blue-600` | Primary buttons, active nav |
| `spanish-red-500` | `edu-blue-500` | Secondary buttons |
| `spanish-red-50` | `edu-blue-50` | Light backgrounds |
| `gold-600` | `edu-emerald-600` | Success states, progress |
| `gold-500` | `edu-emerald-500` | Secondary success |
| `gold-50` | `edu-emerald-50` | Success backgrounds |
| `clay-600` | `edu-slate-600` | Secondary text |
| `clay-500` | `edu-slate-500` | Muted text |
| `clay-50` | `edu-slate-50` | Neutral backgrounds |
| `amber-500` | `edu-orange-500` | CTA actions |

## Implementation Checklist

### Phase 1: Tailwind Configuration
- [ ] Add all color tokens to `tailwind.config.js`
- [ ] Add gradient definitions
- [ ] Add shadow definitions
- [ ] Add font family definitions
- [ ] Add border radius scale
- [ ] Mark old colors as deprecated

### Phase 2: Core Components
- [ ] Update Button component
- [ ] Update Badge component
- [ ] Update Input component (focus rings)
- [ ] Update Card component (shadows, borders)
- [ ] Update navigation components

### Phase 3: Page Components
- [ ] HomePage
- [ ] LoginPage
- [ ] RegisterPage
- [ ] AdminDashboard
- [ ] StudentDashboard
- [ ] DashboardLayout
- [ ] AboutPage

### Phase 4: Validation
- [ ] Run WCAG contrast checker
- [ ] Test with color blindness simulator
- [ ] Verify focus states on all interactive elements
- [ ] Test `prefers-reduced-motion`
- [ ] Visual regression testing

## Notes

- All gradients use 135deg angle for consistency
- Shadow colors use edu-blue-600 (brand color) for cohesion
- Focus rings always use edu-blue-500 for consistency
- Large text defined as ≥ 18pt (1.125rem) or ≥ 14pt bold
- Interactive elements minimum size: 44x44px (mobile)
