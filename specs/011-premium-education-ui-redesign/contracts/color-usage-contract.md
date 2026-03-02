# Color Usage Contract

**Version**: 1.0.0
**Date**: 2026-03-01
**Status**: Specification

## Purpose

This contract defines the rules and patterns for using colors in the Spanish Class education platform. All developers must follow these guidelines to ensure consistency, accessibility, and professional appearance.

## Color Selection Rules

### Rule 1: Semantic Color Usage

**MUST** use colors based on semantic meaning, not arbitrary preference:

| Purpose | Color | Token | Example |
|---------|-------|-------|---------|
| Primary brand action | Blue | `edu-blue-600` | "Book a Class" button |
| Success / Progress | Emerald | `edu-emerald-600` | Progress bar, "Completed" badge |
| High-priority CTA | Orange | `edu-orange-600` | "Start Free Trial" |
| Warning / Pending | Amber | `edu-amber-500` | "Awaiting Approval" |
| Error / Validation | Red | `edu-red-500` | Error messages only |
| Neutral / Secondary | Slate | `edu-slate-600` | Body text, borders |

**Violation Example** ❌:
```jsx
// WRONG: Using orange for success
<Badge className="bg-edu-orange-100">Completed</Badge>
```

**Correct Example** ✅:
```jsx
// CORRECT: Using emerald for success
<Badge className="bg-edu-emerald-100 text-edu-emerald-700">Completed</Badge>
```

### Rule 2: Contrast Requirements

**MUST** meet WCAG AA contrast ratios:
- Normal text (< 18pt): **4.5:1 minimum**
- Large text (≥ 18pt): **3:1 minimum**
- Interactive elements: **3:1 minimum**

**Implementation**:
```jsx
// MUST use contrast checker before deployment
// Tools: WebAIM Contrast Checker, Stark plugin

// Good: edu-slate-800 on white = 12.6:1 ✅
<p className="text-edu-slate-800 bg-white">Body text</p>

// Bad: edu-slate-400 on white = 3.5:1 ❌
<p className="text-edu-slate-400 bg-white">Body text</p> // TOO LIGHT

// Exception: Large text with edu-slate-500 = 4.9:1 ✅
<h1 className="text-4xl text-edu-slate-500">Heading</h1>
```

### Rule 3: Color + Icon Pattern

**MUST NOT** use color alone to convey information:

**Violation Example** ❌:
```jsx
// WRONG: Color-only status
<Badge className={
  status === 'CONFIRMED' ? 'bg-emerald-100' : 'bg-red-100'
}>
  {status}
</Badge>
```

**Correct Example** ✅:
```jsx
// CORRECT: Color + icon
<Badge className={
  status === 'CONFIRMED' ? 'bg-emerald-100' : 'bg-red-100'
}>
  {status === 'CONFIRMED' ? (
    <CheckCircle className="h-4 w-4 mr-1" />
  ) : (
    <XCircle className="h-4 w-4 mr-1" />
  )}
  {status}
</Badge>
```

### Rule 4: Button Color Hierarchy

**MUST** use button colors to indicate importance:

1. **Primary (Blue)**: Main action per screen
2. **Success (Emerald)**: Completion actions
3. **CTA (Orange)**: Marketing/conversion actions
4. **Secondary (Outline)**: Alternative actions
5. **Ghost**: Tertiary actions

**Implementation**:
```jsx
// Primary action (one per screen)
<Button className="bg-gradient-to-r from-edu-blue-600 to-edu-blue-500">
  Book a Class
</Button>

// Secondary action
<Button variant="outline" className="border-edu-blue-600 text-edu-blue-600">
  View Details
</Button>

// Tertiary action
<Button variant="ghost" className="text-edu-blue-600">
  Cancel
</Button>
```

**Violation Example** ❌:
```jsx
// WRONG: Multiple primary buttons
<div>
  <Button className="bg-edu-blue-600">Action 1</Button>
  <Button className="bg-edu-blue-600">Action 2</Button> // ONLY ONE PRIMARY
</div>
```

### Rule 5: Focus State Requirements

**MUST** provide visible focus indicators:

**Required Pattern**:
```jsx
// All interactive elements MUST have focus ring
<button className="
  focus:ring-2
  focus:ring-edu-blue-500
  focus:ring-offset-2
  focus:outline-none
">
```

**Dark Background Variation**:
```jsx
<button className="
  bg-edu-blue-600
  focus:ring-2
  focus:ring-white
  focus:ring-offset-2
  focus:ring-offset-edu-blue-600
">
```

**Violation Example** ❌:
```jsx
// WRONG: No focus state
<button className="outline-none">Click</button>

// WRONG: Focus removed without alternative
<button className="focus:outline-none">Click</button>
```

## Component-Specific Contracts

### Button Component Contract

```typescript
interface ButtonColorContract {
  // Primary action
  variant: 'primary' => 'bg-gradient-to-r from-edu-blue-600 to-edu-blue-500'

  // Success action
  variant: 'success' => 'bg-gradient-to-r from-edu-emerald-600 to-edu-emerald-500'

  // CTA action
  variant: 'cta' => 'bg-gradient-to-r from-edu-orange-600 to-edu-orange-500'

  // Secondary
  variant: 'secondary' => 'border-2 border-edu-blue-600 text-edu-blue-600 bg-white'

  // Ghost
  variant: 'ghost' => 'text-edu-blue-600 hover:bg-edu-blue-50'

  // Destructive
  variant: 'destructive' => 'bg-edu-red-600 text-white'
}
```

**Hover States**:
- Primary: `hover:from-edu-blue-700 hover:to-edu-blue-600`
- Success: `hover:from-edu-emerald-700 hover:to-edu-emerald-600`
- CTA: `hover:from-edu-orange-700 hover:to-edu-orange-600`

**Disabled State**:
```jsx
disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
```

### Badge Component Contract

```typescript
interface BadgeColorContract {
  // Primary/Info
  variant: 'primary' => 'bg-edu-blue-100 text-edu-blue-700 border-edu-blue-200'

  // Success
  variant: 'success' => 'bg-edu-emerald-100 text-edu-emerald-700 border-edu-emerald-200'

  // Warning
  variant: 'warning' => 'bg-edu-amber-100 text-edu-amber-700 border-edu-amber-200'

  // Error
  variant: 'error' => 'bg-edu-red-100 text-edu-red-700 border-edu-red-200'

  // Neutral
  variant: 'neutral' => 'bg-edu-slate-100 text-edu-slate-700 border-edu-slate-200'
}
```

### Navigation Component Contract

```typescript
interface NavigationColorContract {
  // Active state
  isActive: true => 'bg-gradient-to-r from-edu-blue-600 to-edu-blue-500 text-white shadow-glow-blue'

  // Inactive state
  isActive: false => 'text-edu-slate-600 hover:text-edu-slate-900 hover:bg-edu-slate-100'

  // Logo
  logo => 'bg-gradient-to-br from-edu-blue-500 to-edu-emerald-500'
}
```

### Progress Bar Contract

```typescript
interface ProgressBarColorContract {
  // Learning progress
  type: 'learning' => {
    background: 'bg-edu-slate-100',
    fill: 'bg-gradient-to-r from-edu-emerald-600 to-edu-emerald-500'
  }

  // Multi-level progress
  type: 'multi-level' => {
    background: 'bg-edu-slate-100',
    fill: 'bg-gradient-to-r from-edu-blue-600 via-edu-emerald-600 to-edu-orange-500'
  }

  // Loading progress
  type: 'loading' => {
    background: 'bg-edu-slate-200',
    fill: 'bg-edu-blue-600 animate-pulse'
  }
}
```

## Background Contracts

### Page Backgrounds

```typescript
interface PageBackgroundContract {
  // Main pages
  type: 'page' => 'bg-gradient-to-br from-edu-slate-50 via-white to-edu-blue-50/30'

  // Hero sections
  type: 'hero' => 'bg-gradient-to-br from-edu-blue-600 to-edu-emerald-600'

  // Feature sections
  type: 'feature' => 'bg-gradient-to-br from-edu-blue-50/30 to-edu-emerald-50/30'

  // CTA sections
  type: 'cta' => 'bg-gradient-to-br from-edu-orange-600 to-edu-orange-500'

  // Dark sections
  type: 'dark' => 'bg-edu-slate-900'
}
```

### Card Backgrounds

```typescript
interface CardBackgroundContract {
  // Default card
  type: 'default' => 'bg-white border border-edu-slate-200'

  // Highlighted card
  type: 'highlighted' => 'bg-gradient-to-br from-edu-blue-50 to-white border border-edu-blue-200'

  // Interactive card
  type: 'interactive' => 'bg-white hover:bg-edu-blue-50 border border-edu-slate-200 hover:border-edu-blue-200'
}
```

## Shadow Contracts

### Elevation Levels

```typescript
interface ShadowContract {
  // Level 1: Default cards
  level: 1 => 'shadow-soft'

  // Level 2: Floating panels
  level: 2 => 'shadow-medium'

  // Level 3: Modals
  level: 3 => 'shadow-large'

  // Brand shadows
  brand: 'blue' => 'shadow-glow-blue'
  brand: 'emerald' => 'shadow-glow-emerald'
  brand: 'orange' => 'shadow-glow-orange'
}
```

## Migration Validation

### Pre-Commit Checklist

Before committing color changes:

- [ ] All text meets WCAG AA contrast (4.5:1 for normal, 3:1 for large)
- [ ] Status information uses color + icon (not color alone)
- [ ] Focus states are visible on all interactive elements
- [ ] Only one primary button per screen/section
- [ ] Semantic color usage (blue=primary, emerald=success, orange=CTA)
- [ ] Hover states use appropriate color darkening
- [ ] Disabled states use `edu-slate-300` or `opacity-50`

### Automated Testing

```bash
# Run contrast checker
npm run test:contrast

# Run accessibility audit
npm run test:a11y

# Visual regression
npm run test:visual
```

## Examples

### Complete Button Example

```jsx
// Primary Button
<Button className="
  bg-gradient-to-r from-edu-blue-600 to-edu-blue-500
  hover:from-edu-blue-700 hover:to-edu-blue-600
  focus:ring-2 focus:ring-edu-blue-500 focus:ring-offset-2
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
  text-white font-semibold
  shadow-lg shadow-glow-blue
  transition-all duration-200
">
  Book a Class
</Button>
```

### Complete Badge Example

```jsx
// Success Badge with Icon
<Badge className="
  bg-edu-emerald-100
  text-edu-emerald-700
  border border-edu-emerald-200
  px-3 py-1
  inline-flex items-center gap-1
">
  <CheckCircle className="h-4 w-4" />
  Completed
</Badge>
```

### Complete Card Example

```jsx
// Interactive Card
<div className="
  group
  bg-white
  rounded-2xl
  p-6
  border border-edu-slate-200
  shadow-soft
  hover:shadow-xl
  hover:border-edu-blue-200
  transition-all duration-300
  cursor-pointer
">
  {/* Card content */}
</div>
```

## Enforcement

1. **Code Review**: All color changes must be reviewed for compliance
2. **Linting**: Custom ESLint rules check for deprecated color classes
3. **CI/CD**: Automated tests verify contrast ratios
4. **Documentation**: This contract is the source of truth

## Version History

- **1.0.0** (2026-03-01): Initial contract based on research.md findings
