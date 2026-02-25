# Quickstart Guide: Premium Frontend Design System

**Feature**: 004-premium-frontend
**Date**: 2026-02-15

## Overview

This guide provides step-by-step instructions for setting up the development environment, running tests, and working with the premium frontend design system.

---

## Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: 2.x or higher
- **Chrome**: Latest version (for Lighthouse audits)
- **VS Code** (recommended): With extensions for Tailwind CSS, ESLint, Prettier

---

## 1. Environment Setup

### 1.1 Install Dependencies

From the project root:

```bash
# Install all workspace dependencies
npm install

# Verify frontend dependencies
cd packages/frontend
npm list
```

**Key Dependencies Installed:**
- React 18.2
- Vite 5.2
- Tailwind CSS 3.4
- Radix UI components
- Framer Motion 11.1
- TanStack Query 5.32
- react-helmet-async (for SEO)

### 1.2 Install Design System Tools

```bash
# Install design system dev dependencies
npm install -D @tailwindcss/container-queries \
  vite-plugin-imagemin \
  vite-plugin-critical \
  rollup-plugin-visualizer \
  @axe-core/react \
  web-vitals

# Install Lighthouse CI globally
npm install -g @lhci/cli
```

### 1.3 Configure Environment Variables

No additional environment variables needed for frontend design system changes.

---

## 2. Design Tokens Configuration

### 2.1 Tailwind Config Setup

The design system is configured in `packages/frontend/tailwind.config.js`.

**Current Spanish-inspired palette (already configured):**
- Spanish Red: #B91C1C (600 shade)
- Gold: #D97706 (600 shade)
- Terracotta, Olive, Cream scales (cultural accents)

**No changes needed** - existing config already implements the design system from research.md.

### 2.2 Design Token TypeScript File (Optional)

Create `packages/frontend/src/lib/design-tokens.ts`:

```typescript
export const designTokens = {
  colors: {
    brand: {
      primary: '#B91C1C', // Spanish Red 600
      secondary: '#D97706', // Gold 600
    },
  },
  spacing: {
    base: 8, // 8px base unit
  },
  // ... (see data-model.md for full structure)
};
```

### 2.3 CSS Variables Setup

Existing `packages/frontend/src/styles/globals.css` already includes design tokens as CSS variables:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... existing variables ... */
  }
}
```

**No changes needed** - existing setup is compatible with the new design system.

---

## 3. Self-Hosting Fonts

### 3.1 Download Fonts

**Inter Variable Font:**
```bash
# Download from Google Fonts (with variable weights)
# Or use pre-downloaded fonts from /public/fonts/
```

**Playfair Display:**
```bash
# Download serif font for headings
```

### 3.2 Add Fonts to Project

```bash
# Create fonts directory
mkdir -p packages/frontend/public/fonts

# Copy font files
cp inter-variable.woff2 packages/frontend/public/fonts/
cp playfair-display.woff2 packages/frontend/public/fonts/
```

### 3.3 Update Font Loading

Edit `packages/frontend/index.html`:

```html
<head>
  <!-- Remove Google Fonts CDN -->
  <!-- <link href="https://fonts.googleapis.com/css2?family=Inter..." /> -->

  <!-- Add font preloading -->
  <link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/playfair-display.woff2" as="font" type="font/woff2" crossorigin />
</head>
```

Edit `packages/frontend/src/styles/globals.css`:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Playfair Display';
  src: url('/fonts/playfair-display.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
  font-style: normal;
}
```

---

## 4. Development Workflow

### 4.1 Start Development Server

```bash
cd packages/frontend
npm run dev
```

**Access**: http://localhost:5173

**Hot Module Replacement (HMR)**: Enabled automatically by Vite

### 4.2 TypeScript Type Checking

```bash
# Check types without building
npm run typecheck
```

### 4.3 Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 5. Accessibility Testing

### 5.1 Runtime Accessibility Testing (Development)

Install axe-core React:

```bash
npm install -D @axe-core/react
```

Add to `packages/frontend/src/main.tsx`:

```typescript
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**Result**: Accessibility violations logged to console during development.

### 5.2 Manual Keyboard Testing

**Test Checklist:**
1. Unplug mouse or don't use it
2. Press `Tab` to navigate through interactive elements
3. Verify all buttons, links, and inputs are reachable
4. Check focus indicators are visible
5. Test modal/dropdown focus traps
6. Verify `Escape` closes overlays
7. Test form submission with `Enter` key

### 5.3 Screen Reader Testing

**macOS (VoiceOver):**
```bash
# Enable VoiceOver
Cmd + F5

# Navigate
Ctrl + Option + Arrow keys
```

**Windows (NVDA):**
1. Download NVDA (free)
2. Enable with `Ctrl + Alt + N`
3. Navigate with Arrow keys

### 5.4 Chrome DevTools Accessibility Audit

1. Open Chrome DevTools (`F12` or `Cmd + Option + I`)
2. Navigate to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Analyze page load"
5. Review violations and warnings

**Target**: Accessibility score 95+

### 5.5 axe DevTools Extension

1. Install [axe DevTools Chrome Extension](https://www.deque.com/axe/devtools/)
2. Open Chrome DevTools → axe DevTools tab
3. Click "Scan ALL of my page"
4. Review violations by severity

**Target**: 0 critical/serious violations

---

## 6. Performance Testing

### 6.1 Local Lighthouse Audit

**Development Build:**
```bash
npm run build
npm run preview
```

**Run Lighthouse:**
1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Select categories: Performance, Accessibility, SEO
4. Choose device: Mobile or Desktop
5. Click "Analyze page load"

**Targets:**
- Performance: 90+
- Accessibility: 95+
- SEO: 95+

### 6.2 Lighthouse CI (Automated)

**Setup (one-time):**
```bash
# Create Lighthouse CI config
touch packages/frontend/lighthouse.config.js
```

**Config (`lighthouse.config.js`):**
```javascript
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Run Lighthouse CI:**
```bash
npm run build
lhci autorun
```

### 6.3 Bundle Size Analysis

```bash
# Install visualizer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});

# Build and analyze
npm run build
```

**Result**: Opens interactive bundle size visualization in browser.

**Target**: Main chunk < 200kb gzipped

### 6.4 Web Vitals Monitoring (Runtime)

Install Web Vitals:
```bash
npm install web-vitals
```

Add to `packages/frontend/src/main.tsx`:

```typescript
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics in production:
  // gtag('event', metric.name, { value: metric.value });
}

onCLS(reportWebVitals);
onFCP(reportWebVitals);
onLCP(reportWebVitals);
onTTFB(reportWebVitals);
onINP(reportWebVitals);
```

**Result**: Real-world performance metrics logged to console.

---

## 7. Image Optimization

### 7.1 Convert Images to WebP/AVIF

**Install imagemin:**
```bash
npm install -D vite-plugin-imagemin @vite-pwa/assets-generator
```

**Add to vite.config.ts:**
```typescript
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      webp: { quality: 80 },
      svgo: { plugins: [{ removeViewBox: false }] },
    }),
  ],
});
```

### 7.2 Generate Responsive Images

**Manual conversion:**
```bash
# Install sharp-cli
npm install -g sharp-cli

# Convert to WebP
sharp -i input.jpg -o output.webp -q 80

# Generate multiple sizes
sharp -i hero.jpg -o hero-400.webp -w 400 -q 80
sharp -i hero.jpg -o hero-800.webp -w 800 -q 80
sharp -i hero.jpg -o hero-1200.webp -w 1200 -q 80
```

**Usage in components:**
```jsx
<picture>
  <source type="image/webp" srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w" />
  <img src="hero-800.jpg" srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w" sizes="(max-width: 640px) 100vw, 800px" loading="lazy" alt="Spanish class hero" />
</picture>
```

---

## 8. SEO Setup

### 8.1 Install react-helmet-async

```bash
npm install react-helmet-async
```

### 8.2 Wrap App in HelmetProvider

Edit `packages/frontend/src/main.tsx`:

```typescript
import { HelmetProvider } from 'react-helmet-async';

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <App />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
```

### 8.3 Add SEO to Pages

```typescript
import { Helmet } from 'react-helmet-async';

function HomePage() {
  return (
    <>
      <Helmet>
        <title>Premium Spanish Classes Online | SpanishClass</title>
        <meta name="description" content="Book premium Spanish lessons with certified teachers. Personalized 1-on-1 classes starting at 2000 RSD." />
        <link rel="canonical" href="https://spanishclass.com/" />

        {/* Open Graph */}
        <meta property="og:title" content="Premium Spanish Classes Online" />
        <meta property="og:description" content="Book premium Spanish lessons with certified teachers" />
        <meta property="og:image" content="https://spanishclass.com/og-image.jpg" />
        <meta property="og:url" content="https://spanishclass.com/" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium Spanish Classes Online" />
        <meta name="twitter:image" content="https://spanishclass.com/twitter-image.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SpanishClass",
            "url": "https://spanishclass.com",
            "logo": "https://spanishclass.com/logo.png"
          })}
        </script>
      </Helmet>

      {/* Page content */}
    </>
  );
}
```

### 8.4 Generate Sitemap

Create `packages/frontend/public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://spanishclass.com/</loc>
    <lastmod>2026-02-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Add more URLs -->
</urlset>
```

**Submit to Google Search Console**: https://search.google.com/search-console

---

## 9. Code Splitting

### 9.1 Route-Based Code Splitting

Update `packages/frontend/src/App.tsx`:

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 9.2 Manual Chunks (Vite Config)

Edit `packages/frontend/vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-animation': ['framer-motion'],
        },
      },
    },
  },
});
```

---

## 10. Production Build

### 10.1 Build for Production

```bash
cd packages/frontend
npm run build
```

**Output**: `dist/` directory with optimized assets

### 10.2 Preview Production Build

```bash
npm run preview
```

**Access**: http://localhost:4173

### 10.3 Verify Build

**Checklist:**
- ✅ No TypeScript errors (`npm run typecheck`)
- ✅ No ESLint errors (`npm run lint`)
- ✅ Build completes successfully
- ✅ Preview loads correctly
- ✅ Lighthouse scores meet targets (90+, 95+, 95+)
- ✅ axe audit passes (0 violations)
- ✅ Accessibility checklist complete

---

## 11. Continuous Integration

### 11.1 GitHub Actions Workflow

Create `.github/workflows/frontend-ci.yml`:

```yaml
name: Frontend CI

on:
  pull_request:
    paths:
      - 'packages/frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck --workspace=@spanish-class/frontend
      - run: npm run lint --workspace=@spanish-class/frontend
      - run: npm run build --workspace=@spanish-class/frontend

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build --workspace=@spanish-class/frontend
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: http://localhost:5173
          budgetPath: ./packages/frontend/budget.json
          uploadArtifacts: true
```

### 11.2 Performance Budget

Create `packages/frontend/budget.json`:

```json
{
  "performance": 90,
  "accessibility": 95,
  "seo": 95,
  "first-contentful-paint": 1800,
  "largest-contentful-paint": 2500,
  "total-blocking-time": 200,
  "cumulative-layout-shift": 0.1
}
```

---

## 12. Common Tasks

### Check Current Lighthouse Scores

```bash
npm run build
npm run preview
# Open http://localhost:4173 in Chrome
# DevTools → Lighthouse → Analyze page load
```

### Find Large Dependencies

```bash
npm run build
# Check dist/assets/*.js file sizes
# Look for chunks > 500kb

# Use visualizer for detailed breakdown
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts and rebuild
```

### Test Accessibility

```bash
# Automated
npm run build
npm run preview
# Chrome → DevTools → Lighthouse → Accessibility category

# Manual keyboard testing
# Unplug mouse, press Tab to navigate

# Screen reader testing
# macOS: Cmd + F5 (VoiceOver)
# Windows: Install NVDA
```

### Optimize Images

```bash
# Install sharp-cli
npm install -g sharp-cli

# Convert and resize
sharp -i input.jpg -o output.webp -w 800 -q 80
```

---

## 13. Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf packages/frontend/node_modules/.vite
rm -rf packages/frontend/dist

# Rebuild
npm run build
```

### Lighthouse Scores Below Target

**Performance < 90:**
- Check bundle sizes (target: main chunk < 200kb)
- Verify code splitting is working
- Optimize images (WebP, lazy loading)
- Check for large dependencies

**Accessibility < 95:**
- Run axe DevTools scan
- Check color contrast (4.5:1 minimum)
- Verify ARIA labels on icon buttons
- Test keyboard navigation

**SEO < 95:**
- Verify unique meta tags on all pages
- Check robots.txt exists
- Ensure sitemap.xml is present
- Validate structured data with Google's tool

### Fonts Not Loading

```bash
# Verify fonts exist
ls packages/frontend/public/fonts/

# Check browser Network tab
# Look for 404 errors on font files

# Verify font-face declarations in globals.css
# Ensure correct file paths and formats
```

---

## 14. Next Steps

After completing this quickstart:

1. **Review design system documentation**
   - Read `data-model.md` for design token structure
   - Review `contracts/component-api.ts` for component props
   - Study `contracts/accessibility.spec.ts` for WCAG requirements

2. **Generate tasks**
   - Run `/speckit.tasks` to create actionable task breakdown
   - Tasks will be organized by priority and dependencies

3. **Implement redesign**
   - Run `/speckit.implement` to execute tasks
   - Follow TDD approach (tests first, then implementation)
   - Verify accessibility and performance at each step

4. **Deploy**
   - Create pull request with all changes
   - Ensure CI passes (Lighthouse, linting, type checking)
   - Request code review
   - Merge to main after approval

---

## 15. Resources

**Design System:**
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Radix UI Docs](https://www.radix-ui.com)
- [Framer Motion Docs](https://www.framer.com/motion/)

**Accessibility:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

**Performance:**
- [Web.dev Performance Guides](https://web.dev/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

**SEO:**
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

---

**Questions?** Refer to `research.md` for design decisions, `plan.md` for architecture overview, and `contracts/` for API specifications.
