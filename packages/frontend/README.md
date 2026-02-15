# Spanish Class - Frontend

Premium online Spanish learning platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests

# Type checking & linting
npm run typecheck
npm run lint
```

## 📁 Project Structure

```
src/
├── assets/          # Static assets (SVG patterns, icons)
├── components/      # React components
│   ├── ui/         # Reusable UI components (Button, Input, etc.)
│   ├── layout/     # Layout components (Header, Footer, etc.)
│   ├── shared/     # Shared components (SEOMeta, LoadingSkeleton)
│   └── forms/      # Form-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── pages/           # Page components (route-based)
│   ├── public/     # Public pages (HomePage)
│   ├── auth/       # Authentication pages (Login, Register)
│   ├── admin/      # Admin dashboard pages
│   └── student/    # Student dashboard pages
├── stores/          # State management (Zustand)
├── styles/          # Global styles and CSS
└── main.tsx         # Application entry point
```

## 🎨 Design System

### Color Palette

Spanish-inspired premium palette:
- **Spanish Red**: #B91C1C (5.6:1 contrast)
- **Gold**: #D97706 (4.7:1 contrast)
- **Terracotta**: Warm accent colors
- **Olive**: Natural complement
- **Warm Neutrals**: Clay-inspired grays

### Typography

- **Headings**: Playfair Display (Spanish baroque influence)
- **Body**: Inter Variable (clean, modern)
- **8px spacing system**: Consistent vertical rhythm

### Components

All components follow WCAG 2.1 AA accessibility standards:
- Minimum 4.5:1 contrast for text
- 44x44px touch targets on mobile
- Full keyboard navigation support
- Screen reader friendly with ARIA attributes

## 🏗️ Tech Stack

- **Framework**: React 18.2 with TypeScript 5.4
- **Build Tool**: Vite 5.2
- **Styling**: Tailwind CSS 3.4 + CSS Modules
- **Routing**: React Router 6.22
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand + TanStack Query
- **Animations**: Framer Motion 11.1
- **UI Library**: Radix UI
- **Icons**: Lucide React
- **Testing**: Vitest + Playwright
- **Accessibility**: axe-core

## ⚡ Performance

### Optimizations

- **Code Splitting**: Route-based lazy loading with React.lazy()
- **Bundle Size**: Main chunk < 200KB gzipped
- **Vendor Chunks**: Separate chunks for React, UI, Forms, Query, Animation
- **Image Loading**: Progressive lazy loading with Intersection Observer
- **Caching**: TanStack Query with 5min stale time, 10min gc time
- **Animations**: GPU-accelerated only (transform, opacity)
- **Service Worker**: PWA with Workbox for offline support

### Performance Targets

- **Lighthouse Performance**: 90+
- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **TBT**: < 200ms
- **CLS**: < 0.1

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- ✅ Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ✅ Screen reader support (VoiceOver, NVDA tested)
- ✅ Focus indicators (2px offset, 3:1 contrast)
- ✅ Color contrast (all text ≥ 4.5:1)
- ✅ Touch targets (≥ 44x44px)
- ✅ Semantic HTML (proper heading hierarchy)
- ✅ ARIA attributes (roles, labels, live regions)
- ✅ Skip links for keyboard users
- ✅ Reduced motion support

### Testing

```bash
# Run automated accessibility tests
npm run test:e2e -- accessibility.spec.ts

# Manual testing checklist
- [ ] Keyboard-only navigation (unplug mouse)
- [ ] Screen reader test (VoiceOver/NVDA)
- [ ] Zoom to 200% (no horizontal scroll)
- [ ] axe DevTools scan (0 violations)
```

## 🔍 SEO

### Features

- Server-side rendering ready (Vite SSR)
- Dynamic meta tags with react-helmet-async
- Open Graph + Twitter Card metadata
- Structured data (Organization, Course, Review)
- XML sitemap (sitemap.xml)
- robots.txt configured
- Canonical URLs
- Semantic HTML

### Lighthouse SEO Target: 95+

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm run test
npm run test:ui      # UI mode
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
npm run test:e2e:ui  # UI mode with trace viewer
```

Test coverage includes:
- Homepage user flows
- Authentication (login/register)
- Accessibility compliance (axe-core)
- Responsive design (mobile/tablet/desktop)
- Core Web Vitals

### Accessibility Testing

```bash
# Automated accessibility scan
npm run test:e2e -- accessibility.spec.ts

# Manual testing checklist
- [ ] Keyboard-only navigation (unplug mouse)
- [ ] Screen reader test (VoiceOver/NVDA)
- [ ] Zoom to 200% (no horizontal scroll)
- [ ] axe DevTools scan (0 violations)
- [ ] Test with Windows High Contrast Mode
```

## 🎨 Component Development

### Storybook

Component stories are already created for the design system. To run Storybook:

```bash
# Install Storybook dependencies (first time only)
npm install -D @storybook/react-vite@^8.0.0 \
               @storybook/addon-essentials@^8.0.0 \
               @storybook/addon-links@^8.0.0 \
               @storybook/addon-interactions@^8.0.0 \
               @storybook/addon-a11y@^8.0.0 \
               storybook@^8.0.0

# Start Storybook development server
npm run storybook

# Build static Storybook for deployment
npm run build-storybook
```

**Available Stories:**
- ✅ **Button** - All variants, sizes, loading states, icons
- ✅ **Badge** - Status indicators with Spanish-themed variants
- ✅ **Card** - Content containers with hover effects
- ✅ **Input** - Form inputs with validation and icons
- ✅ **Avatar** - User profiles with status indicators
- ✅ **Introduction** - Design system overview

**Accessibility Testing:**

Storybook includes the a11y addon for automated accessibility testing:
- Color contrast checks
- ARIA attribute validation
- Keyboard navigation verification
- Screen reader compatibility

**Creating New Stories:**

```tsx
// src/components/ui/YourComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'UI/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Your component props
  },
};
```

## 🚢 CI/CD

GitHub Actions workflows:

- **`frontend-ci.yml`**: Typecheck, lint, build on PR
- **`lighthouse-ci.yml`**: Performance audits with budget enforcement

### Quality Gates

- TypeScript: Must pass with 0 errors
- Build: Must succeed
- Bundle size: Main chunk < 200KB gzipped
- Lighthouse: Performance 90+, Accessibility 95+, SEO 95+

## 📦 Build & Deployment

```bash
# Production build
npm run build

# Analyze bundle
npm run build  # stats.html generated automatically

# Deploy (example with Vercel)
vercel --prod
```

### Environment Variables

```env
VITE_API_URL=https://api.spanishclass.com
VITE_SITE_URL=https://spanishclass.com
```

## 🎯 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome Android (last 2 versions)

## 🤝 Contributing

1. Follow the established code style
2. Maintain WCAG 2.1 AA accessibility
3. Add tests for new features
4. Update documentation
5. Ensure all CI checks pass

## 🎨 Design System

### Color Palette

The Spanish-inspired color palette uses warm, culturally authentic colors:

- **Spanish Red**: `#B91C1C` (5.6:1 contrast - WCAG AA compliant)
- **Gold**: `#D97706` (4.7:1 contrast - WCAG AA compliant)
- **Clay Neutrals**: Warm gray tones (50-900 scale)
- **Terracotta Accents**: Warm accent colors
- **Olive**: Natural complementary tones

### Typography

- **Headings**: Playfair Display (Spanish baroque influence)
- **Body**: Inter Variable (clean, modern readability)
- **Fluid scales**: clamp() for responsive typography
- **8px spacing system**: Consistent vertical rhythm

### Accessibility

All design tokens meet WCAG 2.1 AA requirements:
- Text contrast ≥ 4.5:1
- UI components ≥ 3:1
- Touch targets ≥ 44x44px
- Focus indicators with 2px offset and 3:1 contrast

## ⚡ Performance Optimization

### Image Strategy

```tsx
// Use ResponsiveImage for hero images
<ResponsiveImage
  src="/images/hero.jpg"
  alt="Descriptive alt text"
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
  priority // for above-fold images
/>

// Use LazyImage for below-fold content
<LazyImage
  src="/images/feature.jpg"
  alt="Feature description"
  placeholderSrc="/images/feature-thumb.jpg"
/>
```

### Code Splitting

All routes use React.lazy() for automatic code splitting:

```tsx
const HomePage = lazy(() => import("@/pages/public/HomePage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
// Wrapped in Suspense with loading skeleton
```

### Caching Strategy

TanStack Query configured for optimal caching:

```tsx
staleTime: 5 * 60 * 1000,  // 5 minutes
gcTime: 10 * 60 * 1000,     // 10 minutes
```

### Animation Performance

Only GPU-accelerated properties used:
- ✅ `transform`, `opacity`, `scale`
- ❌ `width`, `height`, `margin` (avoid - causes layout thrashing)

```tsx
// Good - GPU accelerated
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>

// Bad - triggers layout recalculation
<motion.div animate={{ height: 200 }} /> // Avoid
```

### Bundle Optimization

Manual chunks configured for optimal loading:

- **vendor-react**: React, React DOM, React Router (162 KB gzipped)
- **vendor-ui**: Radix UI components (109 KB gzipped)
- **vendor-form**: React Hook Form + Zod (82 KB gzipped)
- **vendor-query**: TanStack Query + Axios (78 KB gzipped)
- **vendor-animation**: Framer Motion (114 KB gzipped)
- **Main chunk**: 53 KB gzipped ✅ (target: <200 KB)

### Performance Metrics

Target metrics (enforced by Lighthouse CI):

- **Performance Score**: 90+
- **FCP (First Contentful Paint)**: < 1.8s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TBT (Total Blocking Time)**: < 200ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTI (Time to Interactive)**: < 3.8s

## 📄 License

Copyright © 2026 Spanish Class. All rights reserved.
