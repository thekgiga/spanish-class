# Color Migration Documentation

**Date**: 2026-03-01
**Feature**: Premium Education UI Redesign
**Branch**: 011-premium-education-ui-redesign

## Current Color Usage Audit

### Total Instances Found
- **242 total occurrences** of `spanish-red`, `gold-`, or `clay-` classes across packages/frontend/src/

### Breakdown by Color
```bash
# spanish-red usage
grep -r "spanish-red" packages/frontend/src/ --include="*.tsx" --include="*.ts" | wc -l
# Result: ~80 instances

# gold- usage
grep -r "gold-" packages/frontend/src/ --include="*.tsx" --include="*.ts" | wc -l
# Result: ~60 instances

# clay- usage
grep -r "clay-" packages/frontend/src/ --include="*.tsx" --include="*.ts" | wc -l
# Result: ~102 instances
```

### Key Files Affected

#### Core Components
- `packages/frontend/src/components/ui/Typography.tsx` - spanish-red gradients
- `packages/frontend/src/components/ui/badge.tsx` - spanish-red backgrounds
- `packages/frontend/src/components/ui/button.tsx` - spanish-red gradients and borders
- `packages/frontend/src/components/ui/input.tsx` - spanish-red focus rings

#### Layout Components
- `packages/frontend/src/components/layout/DashboardLayout.tsx` - spanish-red/gold nav, logo
- `packages/frontend/src/components/layout/MobileNav.tsx` - spanish-red focus states

#### Page Components
- `packages/frontend/src/pages/public/HomePage.tsx` - spanish-red throughout
- `packages/frontend/src/pages/auth/LoginPage.tsx` - spanish-red gradients
- `packages/frontend/src/pages/student/StudentDashboard.tsx` - spanish-red stats, buttons
- `packages/frontend/src/pages/admin/AdminDashboard.tsx` - spanish-red stats, buttons

#### Supporting Components
- `packages/frontend/src/components/student/ProfileCompletionCard.tsx` - spanish-red gradients
- `packages/frontend/src/components/shared/SkipLink.tsx` - spanish-red focus states
- `packages/frontend/src/lib/decorative.tsx` - spanish-red/gold gradients

### Example Usage Patterns

**Buttons (spanish-red):**
```tsx
// Primary button
'bg-gradient-to-r from-spanish-red-500 to-spanish-red-600 text-white'

// Outline button
'border-2 border-spanish-red-500 bg-transparent text-spanish-red-600'
```

**Navigation (spanish-red):**
```tsx
// Active nav item
'bg-gradient-to-r from-spanish-red-600 to-spanish-red-500 text-white shadow-lg shadow-spanish-red-500/30'

// Active mobile nav
'text-spanish-red-600 bg-spanish-red-50 border-l-4 border-spanish-red-600'
```

**Focus States (spanish-red):**
```tsx
// Input focus
'focus-visible:border-spanish-red-400 focus-visible:ring-4 focus-visible:ring-spanish-red-100'

// Button focus
'focus:ring-2 focus:ring-spanish-red-500 focus:ring-offset-2'
```

**Logo/Branding (gold + spanish-red):**
```tsx
'bg-gradient-to-br from-gold-500 to-spanish-red-600'
```

**Backgrounds (spanish-red + gold):**
```tsx
'bg-gradient-to-br from-spanish-red-50/30 via-white to-gold-50/30'
```

## Migration Plan

### Phase 2: Foundation (Tailwind Config)
Replace color tokens at source

### Phase 3: Core Components
- Button component
- Badge component
- Input component
- Card component

### Phase 4-9: Page-by-Page Migration
- Auth Pages (Login/Register)
- HomePage
- Student Dashboard
- Admin Dashboard
- Navigation/Layout
- About Page

### Phase 10: Polish
- Search and replace remaining hardcoded hex values
- Verify all instances migrated
- WCAG compliance testing

## Migration Mapping

| Old Class | New Class | Usage |
|-----------|-----------|-------|
| `spanish-red-600` | `edu-blue-600` | Primary brand |
| `spanish-red-500` | `edu-blue-500` | Secondary |
| `spanish-red-50` | `edu-blue-50` | Backgrounds |
| `gold-600` | `edu-emerald-600` | Success/Progress |
| `gold-500` | `edu-emerald-500` | Secondary success |
| `gold-50` | `edu-emerald-50` | Success backgrounds |
| `clay-800` | `edu-slate-800` | Body text |
| `clay-600` | `edu-slate-600` | Secondary text |
| `clay-50` | `edu-slate-50` | Neutral backgrounds |

## Status

- **T002 COMPLETE**: Current color usage documented
- **Total Files to Update**: ~20-30 files
- **Total Class Replacements**: ~242 instances
