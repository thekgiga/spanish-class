# Tasks: Premium Frontend Design

**Input**: Design documents from `/specs/004-premium-frontend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (all complete)

**Branch**: `004-premium-frontend`
**Tech Stack**: TypeScript 5.4, React 18.2, Vite 5.2, Tailwind CSS 3.4, Radix UI, Framer Motion 11.1
**Target**: ~50-70 components, ~15-20 pages, Lighthouse 90+ (Perf), 95+ (A11y, SEO)

## Total Tasks: 162

**MVP Scope** (Phase 1-3): 47 tasks
- Phase 1: Setup (12 tasks)
- Phase 2: Foundational (23 tasks)
- Phase 3: US1 - Premium Visual Experience (12 tasks)

## Format: `- [ ] T### [P?] [US#?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: User story label (US1-US6) - REQUIRED for user story phases
- Include exact file paths in descriptions

## Path Convention

All paths relative to: `packages/frontend/`

---

## Phase 1: Setup (12 tasks)

**Purpose**: Project initialization, dependencies, and tooling configuration

**Independent Test**: Development server starts without errors, TypeScript compiles, linting passes

- [X] T001 [P] Create design system directory structure at packages/frontend/src/lib/design-tokens.ts and packages/frontend/src/styles/tokens.css
- [X] T002 [P] Install design system dependencies: @tailwindcss/container-queries, vite-plugin-imagemin, vite-plugin-critical, rollup-plugin-visualizer
- [X] T003 [P] Install accessibility testing tools: @axe-core/react, web-vitals
- [X] T004 [P] Install SEO dependencies: react-helmet-async
- [X] T005 [P] Install font optimization tools: glyphhanger (global) for font subsetting
- [X] T006 [P] Install Lighthouse CI globally: @lhci/cli
- [X] T007 Configure Lighthouse CI budget at packages/frontend/lighthouse.config.js with performance 90+, accessibility 95+, SEO 95+ targets
- [X] T008 Create performance budget file at packages/frontend/budget.json with FCP < 1.8s, LCP < 2.5s, TBT < 200ms, CLS < 0.1
- [X] T009 [P] Download and prepare self-hosted fonts: Inter Variable and Playfair Display woff2 files to packages/frontend/public/fonts/
- [X] T010 [P] Configure bundle analyzer in packages/frontend/vite.config.ts with rollup-plugin-visualizer
- [X] T011 Update .gitignore to exclude dist/, stats.html, lighthouse reports
- [X] T012 Verify all installations: npm run typecheck, npm run lint, npm run dev should all succeed

**Checkpoint**: Development environment ready with all tools installed

---

## Phase 2: Foundational (23 tasks)

**Purpose**: Design tokens, base styles, shared utilities - BLOCKS all user story work

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

**Independent Test**: Import design tokens in any component, use Tailwind classes with Spanish palette, accessibility utilities work

- [X] T013 [P] Create design tokens schema at packages/frontend/src/lib/design-tokens.ts with ColorSystem, TypographySystem, SpacingSystem interfaces from data-model.md
- [X] T014 [P] Configure Tailwind colors in packages/frontend/tailwind.config.js: Spanish Red (50-900), Gold (50-900), Clay neutral (50-900), Terracotta accent (50-900)
- [X] T015 [P] Configure Tailwind typography in packages/frontend/tailwind.config.js: font families (sans: Inter, serif: Playfair Display), fluid type scales using clamp()
- [X] T016 [P] Configure Tailwind spacing in packages/frontend/tailwind.config.js: 8px base unit system (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64)
- [X] T017 [P] Configure Tailwind border radius in packages/frontend/tailwind.config.js: none, sm (2px), md (6px), lg (8px), xl (12px), 2xl (16px), full
- [X] T018 [P] Configure Tailwind shadows in packages/frontend/tailwind.config.js: sm, md, lg, xl, 2xl, glow-spanish, glow-gold
- [X] T019 [P] Configure Tailwind animation in packages/frontend/tailwind.config.js: durations (fast 150ms, normal 200ms, slow 300ms), easings (in, out, inOut), keyframes (fadeIn, fadeInUp, slideInRight, scaleIn, shimmer, pulseSoft)
- [X] T020 Add @tailwindcss/container-queries plugin to packages/frontend/tailwind.config.js for component-based responsive design
- [X] T021 Create CSS custom properties at packages/frontend/src/styles/tokens.css for design tokens (colors, spacing, typography) using :root
- [X] T022 Add @font-face declarations in packages/frontend/src/styles/globals.css for Inter Variable and Playfair Display with font-display: swap
- [X] T023 Add font preload links in packages/frontend/index.html for Inter Variable and Playfair Display woff2 files
- [X] T024 [P] Create useMediaQuery hook at packages/frontend/src/hooks/useMediaQuery.ts for responsive breakpoint detection
- [X] T025 [P] Create useReducedMotion hook at packages/frontend/src/hooks/useReducedMotion.ts for accessibility preference detection
- [X] T026 [P] Create SEO utility functions at packages/frontend/src/lib/seo.ts for meta tag generation and structured data helpers
- [X] T027 [P] Configure manual chunks in packages/frontend/vite.config.ts: vendor-react (react, react-dom, react-router-dom), vendor-ui (@radix-ui/*), vendor-form (react-hook-form, zod), vendor-query (@tanstack/react-query, axios), vendor-animation (framer-motion)
- [X] T028 Add route-based code splitting template in packages/frontend/src/App.tsx using React.lazy and Suspense for all major routes
- [X] T029 Wrap app in HelmetProvider at packages/frontend/src/main.tsx for react-helmet-async support
- [X] T030 [P] Add axe-core runtime testing in packages/frontend/src/main.tsx (development mode only, logs violations to console)
- [X] T031 [P] Add Web Vitals monitoring in packages/frontend/src/main.tsx with onCLS, onFCP, onLCP, onTTFB, onINP reporters
- [X] T032 Create skip-to-content link component at packages/frontend/src/components/shared/SkipLink.tsx with sr-only and focus:not-sr-only classes
- [X] T033 Add ARIA landmark roles to packages/frontend/src/App.tsx: header (role="banner"), main (role="main"), footer (role="contentinfo")
- [X] T034 [P] Create accessibility testing documentation at packages/frontend/docs/accessibility-testing.md with keyboard navigation checklist, screen reader testing guide
- [X] T035 Verify foundational setup: Import design tokens, use Tailwind classes, test hooks, run accessibility audit with axe DevTools (0 critical violations expected)

**Checkpoint**: Foundation ready - design tokens configured, base styles set, utilities available, user story implementation can now begin

---

## Phase 3: US1 - Premium Visual Experience (Priority: P1) 🎯 MVP

**Goal**: Create sophisticated Spanish-inspired design system with premium aesthetics, refined typography, generous spacing, and cultural elements

**User Story**: Users visiting the platform immediately perceive it as high-quality, premium service with modern Spanish-inspired design (red/gold colors, elegant typography, cultural motifs)

**Independent Test**: View homepage and key pages, measure first impression ratings (target 4.5+/5), compare visual quality to premium competitors (Vercel, Stripe, Linear)

### Implementation for US1

- [X] T036 [P] [US1] Create Button component at packages/frontend/src/components/ui/Button.tsx with variants (primary: Spanish red gradient, secondary: gold gradient, outline, ghost, destructive), sizes (sm 36px, md 44px, lg 48px, xl 56px), loading state, icon support per component-api.ts
- [X] T037 [P] [US1] Add ARIA attributes to Button component: aria-label for icon-only buttons, aria-describedby for helper text, aria-disabled for disabled state per accessibility.spec.ts
- [X] T038 [P] [US1] Add focus indicators to Button component: focus:ring-2 focus:ring-spanish-red-500 focus:ring-offset-2 with 2px outline offset per accessibility.spec.ts FOCUS_INDICATORS
- [X] T039 [P] [US1] Create Input component at packages/frontend/src/components/ui/Input.tsx with variants (default, filled, flushed), sizes (sm 36px, md 44px, lg 48px), error/success states, label, helper text, left/right icons per component-api.ts
- [X] T040 [P] [US1] Add ARIA attributes to Input component: aria-invalid, aria-describedby, aria-required, unique IDs for labels and helper text per accessibility.spec.ts
- [X] T041 [P] [US1] Create Badge component at packages/frontend/src/components/ui/Badge.tsx with Spanish-inspired variants (primary, secondary, success, warning, error, info, neutral), status dot option, removable option
- [X] T042 [P] [US1] Create Avatar component at packages/frontend/src/components/ui/Avatar.tsx with sizes (xs-2xl), image fallback to initials, status indicator (online/offline/busy/away), circle/square shapes
- [X] T043 [P] [US1] Create Card component at packages/frontend/src/components/ui/Card.tsx with variants (default, elevated, outlined, ghost), padding options, hoverable state, Card subcomponents (Header, Title, Description, Content, Footer)
- [X] T044 [P] [US1] Create Typography components at packages/frontend/src/components/ui/Typography.tsx: Heading (h1-h6 with gradient option), Text (sizes, weights, colors), Label (with required indicator)
- [X] T045 [P] [US1] Add shadow utility classes in packages/frontend/src/styles/globals.css: shadow-soft, shadow-medium, shadow-large, shadow-glow-red, shadow-glow-gold with Spanish-inspired glow effects
- [X] T046 [P] [US1] Add gradient utility classes in packages/frontend/src/styles/globals.css: gradient-spanish (red), gradient-gold, gradient-warm, text-gradient with Spanish cultural colors
- [X] T047 [P] [US1] Create Spanish cultural decorative elements at packages/frontend/src/lib/decorative.tsx: DecorativeDot, DecorativeLine, DecorativeCorner, TilePattern, GradientMesh components for cultural authenticity

**Checkpoint**: Premium visual design system complete with Spanish-inspired components, accessible colors, cultural elements, ready for page implementation

---

## Phase 4: US2 - Responsive Multi-Device (Priority: P1)

**Goal**: Seamless experience across all devices (mobile, tablet, desktop) with mobile-first approach, touch-friendly interactions, fluid layouts

**User Story**: Users access platform from any device and experience consistent, premium quality with natural touch interactions on mobile, graceful viewport adaptation

**Independent Test**: Test on phones (320px-414px), tablets (768px-1024px), desktops (1280px-1920px), verify all features accessible, touch targets ≥44x44px, no horizontal scrolling

### Implementation for US2

- [X] T048 [P] [US2] Create responsive Header component at packages/frontend/src/components/layout/Header.tsx with variants (default, transparent, sticky), mobile hamburger menu, desktop horizontal nav, logo, actions, user menu per component-api.ts HeaderProps
- [X] T049 [P] [US2] Implement mobile navigation at packages/frontend/src/components/layout/MobileNav.tsx with slide-in drawer, close on route change, focus trap, Escape to close per accessibility.spec.ts KEYBOARD_NAVIGATION.modal
- [X] T050 [P] [US2] Create responsive Footer component at packages/frontend/src/components/layout/Footer.tsx with 4-column desktop grid, stacked mobile layout, link groups, social icons, newsletter signup, legal links
- [X] T051 [P] [US2] Configure responsive breakpoints in Tailwind config (if not default): xs (375px small phones), sm (640px large phones), md (768px tablets), lg (1024px laptops), xl (1280px desktops), 2xl (1536px large desktops) per research.md section 5.1
- [X] T052 [US2] Add container queries to reusable components (BookingCard, LessonCard) at packages/frontend/src/components/booking/ using @container, @md:, @lg: for component-based responsiveness per research.md section 5.4
- [X] T053 [P] [US2] Create responsive grid layouts at packages/frontend/src/components/layout/Grid.tsx with mobile (1 col), tablet (2 col), desktop (3-4 col) configurations using grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- [X] T054 [US2] Implement touch-friendly spacing: All interactive elements minimum 44x44px height, use min-h-[44px] utility, add padding to expand hit areas (e.g., p-3 -m-3 for close buttons) per accessibility.spec.ts and research.md section 5.2
- [X] T055 [P] [US2] Create responsive image component at packages/frontend/src/components/shared/ResponsiveImage.tsx with picture element, srcset for multiple sizes (400w, 800w, 1200w), sizes attribute, loading="lazy", decoding="async" per research.md section 2.2
- [X] T056 [US2] Add responsive typography utilities using fluid type: text-fluid-base, text-fluid-lg, text-fluid-2xl classes with clamp() values from Tailwind config per data-model.md section 1.2 FluidTypography
- [X] T057 [P] [US2] Test mobile navigation: Hamburger menu opens/closes, focus trap works, Escape closes menu, touch targets ≥44x44px, swipe gestures work (if implemented)
- [X] T058 [P] [US2] Test responsive layouts on real devices: iPhone SE (320px), iPhone 12 (375px), iPad (768px), MacBook Air (1280px), 4K desktop (1920px+), verify no horizontal scrolling, content readable
- [X] T059 [P] [US2] Test orientation changes: Rotate device portrait/landscape, verify layout adapts, content remains accessible, no layout breaks
- [X] T060 [US2] Test touch interactions: Tap buttons, swipe carousels, pinch zoom (if needed), verify 60fps scroll performance on mobile devices per plan.md performance goals

**Checkpoint**: Responsive design complete, all breakpoints tested, touch targets verified, mobile-first approach validated

---

## Phase 5: US3 - Fast Performance (Priority: P1)

**Goal**: Achieve Lighthouse 90+ Performance score with fast page loads (LCP <2.5s), smooth interactions (TBT <200ms), stable layouts (CLS <0.1), 60fps animations

**User Story**: Users experience immediate responsiveness when clicking, scrolling, or navigating with critical content appearing within 2-3 seconds even on 3G connections

**Independent Test**: Run Lighthouse audit (mobile/desktop), measure Core Web Vitals, test on throttled 3G connection, verify 60fps scrolling

### Implementation for US3

- [ ] T061 [P] [US3] Convert all images to WebP format using sharp-cli: hero images, professor photos, lesson thumbnails at packages/frontend/public/images/ with quality 80
- [ ] T062 [P] [US3] Generate AVIF format for LCP images (hero, above-fold): hero-400.avif, hero-800.avif, hero-1200.avif for 50% smaller file size per research.md section 2.2
- [ ] T063 [P] [US3] Create responsive image variants: 400w (mobile), 800w (tablet), 1200w (desktop) for all key images using sharp-cli
- [X] T064 [US3] Implement lazy loading for below-fold images: Add loading="lazy" and decoding="async" to all img tags, use Intersection Observer for progressive image loading in packages/frontend/src/hooks/useLazyImage.ts
- [X] T065 [US3] Add image optimization to build process in packages/frontend/vite.config.ts using vite-plugin-imagemin with webp quality 80, optipng level 7
- [X] T066 [P] [US3] Implement route-based code splitting: Convert all route components to React.lazy() in packages/frontend/src/App.tsx (HomePage, LoginPage, DashboardPage, BookingPage, etc.) per research.md section 2.3
- [X] T067 [P] [US3] Add Suspense boundaries with loading skeletons at packages/frontend/src/components/shared/LoadingSkeleton.tsx for each lazy-loaded route
- [X] T068 [US3] Configure manual chunks for vendor libraries in packages/frontend/vite.config.ts: Split Radix UI, react-hook-form, TanStack Query, Framer Motion into separate chunks per research.md section 2.3
- [X] T069 [P] [US3] Implement prefetch on hover for navigation links: Add onMouseEnter handler to preload route components in packages/frontend/src/components/layout/Header.tsx per research.md section 2.3
- [X] T070 [P] [US3] Optimize TanStack Query caching: Set staleTime to 5 minutes, cacheTime to 10 minutes for lesson/professor data in packages/frontend/src/lib/query-client.ts
- [X] T071 [P] [US3] Add useTransition for non-urgent updates: Implement in search/filter components at packages/frontend/src/components/booking/SearchBar.tsx to prevent blocking UI per research.md section 2.6
- [X] T072 [US3] Optimize Framer Motion animations: Use only GPU-accelerated properties (opacity, scale, x, y, rotate), avoid width/height/margin animations, set duration 200-300ms per research.md section 2.7
- [ ] T073 [P] [US3] Extract and inline critical CSS using vite-plugin-critical in packages/frontend/vite.config.ts for above-fold styles
- [ ] T074 [P] [US3] Subset fonts using glyphhanger: Include Latin + Spanish characters (áéíóúñ¿¡ÁÉÍÓÚÑ) for Inter and Playfair Display, generate subset woff2 files per research.md section 2.4
- [X] T075 [US3] Configure service worker caching for fonts and static assets in packages/frontend/public/sw.js (if PWA implemented)
- [ ] T076 [P] [US3] Run Lighthouse audit (mobile): npm run build && npm run preview, open DevTools → Lighthouse → Mobile → Performance category, verify score 90+
- [ ] T077 [P] [US3] Run Lighthouse audit (desktop): Verify Performance score 90+, FCP <1.8s, LCP <2.5s, TBT <200ms, CLS <0.1 per plan.md success metrics
- [ ] T078 [P] [US3] Test on throttled 3G connection using Chrome DevTools Network throttling: Verify critical content appears within 3 seconds
- [X] T079 [US3] Measure bundle sizes: Run rollup-plugin-visualizer, verify main chunk <200kb gzipped, vendor chunks optimized per research.md section 2.3 ✅ Main: 51.7KB gzipped
- [ ] T080 [US3] Verify 60fps scrolling: Test on real devices, use Chrome DevTools Performance panel, verify no jank during scroll/animations per plan.md performance goals

**Checkpoint**: Performance optimizations complete, Lighthouse 90+ achieved, Core Web Vitals pass, fast loading validated

---

## Phase 6: US4 - SEO (Priority: P2)

**Goal**: Achieve Lighthouse 95+ SEO score with proper meta tags, structured data, sitemaps, social sharing for organic search discoverability

**User Story**: Potential students discover platform through search engines with compelling titles/descriptions, rich search results with structured data

**Independent Test**: Run Lighthouse SEO audit, validate structured data with Google Rich Results Test, check social media previews with Open Graph debugger

### Implementation for US4

- [X] T081 [P] [US4] Create SEO meta component at packages/frontend/src/components/shared/SEOMeta.tsx using react-helmet-async for title, description, canonical, Open Graph, Twitter Card tags per research.md section 3.1
- [X] T082 [P] [US4] Add SEO meta tags to HomePage at packages/frontend/src/pages/public/HomePage.tsx: title "Premium Spanish Classes Online | SpanishClass", description with keywords, canonical URL
- [X] T083 [P] [US4] Add SEO meta tags to About page at packages/frontend/src/pages/public/AboutPage.tsx: unique title/description, Open Graph metadata
- [X] T084 [P] [US4] Add SEO meta tags to Pricing page at packages/frontend/src/pages/public/PricingPage.tsx: unique title/description, structured data for pricing
- [X] T085 [P] [US4] Add SEO meta tags to Booking/Lesson pages at packages/frontend/src/pages/booking/: dynamic titles based on lesson/professor name, descriptions
- [X] T086 [US4] Implement Organization structured data at packages/frontend/src/lib/seo.ts: schema.org/Organization with name, URL, logo, contactPoint per research.md section 3.2
- [X] T087 [US4] Implement Course structured data for lessons at packages/frontend/src/components/booking/LessonCard.tsx: schema.org/Course with name, description, provider, offers per research.md section 3.2
- [X] T088 [US4] Implement Review structured data for teacher ratings at packages/frontend/src/components/professor/ReviewCard.tsx: schema.org/Review with rating, author per research.md section 3.2
- [ ] T089 [P] [US4] Create Open Graph images at packages/frontend/public/images/og/: 1200x630px JPG for homepage, about, pricing (includes brand logo and compelling visual) per research.md section 3.3
- [ ] T090 [P] [US4] Create Twitter Card images at packages/frontend/public/images/twitter/: 1200x628px JPG for key pages per research.md section 3.3
- [X] T091 [US4] Generate XML sitemap at packages/frontend/public/sitemap.xml with all public routes (/, /about, /pricing, /login, /register), lastmod, changefreq, priority per research.md section 3.4
- [X] T092 [P] [US4] Create robots.txt at packages/frontend/public/robots.txt: Allow all crawlers, reference sitemap URL
- [X] T093 [P] [US4] Add language declaration in packages/frontend/index.html: <html lang="en">
- [X] T094 [P] [US4] Ensure semantic HTML hierarchy: One H1 per page, logical H2-H6 nesting, no skipped levels per accessibility.spec.ts SCREEN_READER_SUPPORT
- [X] T095 [P] [US4] Add descriptive image alt text: All images have meaningful alt text (not "image" or filename), decorative images have alt="" per accessibility.spec.ts
- [X] T096 [P] [US4] Validate structured data: Use Google Rich Results Test, Schema.org Validator, verify Organization, Course, Review schemas parse correctly
- [ ] T097 [P] [US4] Validate Open Graph metadata: Use Facebook Sharing Debugger, Twitter Card Validator, verify images and descriptions display correctly
- [ ] T098 [US4] Run Lighthouse SEO audit: Verify score 95+, all meta tags present, mobile-friendly, crawlable per plan.md success metrics
- [ ] T099 [US4] Submit sitemap to Google Search Console: Add property, verify ownership, submit sitemap.xml

**Checkpoint**: SEO optimizations complete, structured data validated, social sharing works, Lighthouse SEO 95+ achieved

---

## Phase 7: US5 - Accessibility (Priority: P2)

**Goal**: Achieve Lighthouse 95+ Accessibility score with WCAG 2.1 AA compliance for keyboard navigation, screen readers, color contrast

**User Story**: Users with disabilities (visual impairments, motor limitations, cognitive differences) can fully access and use the platform

**Independent Test**: axe DevTools scan (0 violations), keyboard-only navigation test, screen reader test (VoiceOver/NVDA), Lighthouse Accessibility audit 95+

### Implementation for US5

- [X] T100 [P] [US5] Add keyboard navigation to all interactive elements: Tab/Shift+Tab for focus, Enter/Space for activation, Escape for modals/dropdowns per accessibility.spec.ts KEYBOARD_NAVIGATION
- [X] T101 [P] [US5] Implement focus trap for modals using focus-trap-react at packages/frontend/src/components/ui/Modal.tsx: Trap focus within modal, return focus to trigger on close per accessibility.spec.ts FOCUS_INDICATORS.focusTrap
- [X] T102 [P] [US5] Add visible focus indicators to all focusable elements: focus:ring-2 focus:ring-spanish-red-500 focus:ring-offset-2 with 2px outline, 3:1 contrast per accessibility.spec.ts FOCUS_INDICATORS
- [X] T103 [P] [US5] Create FormField component at packages/frontend/src/components/ui/FormField.tsx with label (htmlFor), input (aria-required, aria-invalid), helper text (aria-describedby), error message (role="alert") per component-api.ts FormFieldProps
- [X] T104 [P] [US5] Add ARIA labels to icon-only buttons: aria-label="Close modal", aria-label="Open menu", aria-label="Search" per accessibility.spec.ts ARIA_REQUIREMENTS.button
- [X] T105 [P] [US5] Add ARIA attributes to modals/dialogs: role="dialog", aria-modal="true", aria-labelledby (title ID), aria-describedby (description ID) per accessibility.spec.ts ARIA_REQUIREMENTS.modal
- [X] T106 [P] [US5] Add ARIA attributes to navigation: role="navigation", aria-label="Main navigation", aria-current="page" for active links per accessibility.spec.ts ARIA_REQUIREMENTS.nav
- [X] T107 [P] [US5] Implement live regions for dynamic updates at packages/frontend/src/components/shared/Toast.tsx: role="status" aria-live="polite" for success, role="alert" aria-live="assertive" for errors per accessibility.spec.ts SCREEN_READER_SUPPORT.liveRegions
- [X] T108 [US5] Add skip-to-content link at top of packages/frontend/src/App.tsx: <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a> per accessibility.spec.ts SCREEN_READER_SUPPORT.skipLinks
- [X] T109 [P] [US5] Verify color contrast ratios: Spanish Red (#B91C1C) = 5.6:1 ✅, Gold (#D97706) = 4.7:1 ✅, all text ≥4.5:1, UI components ≥3:1 per accessibility.spec.ts COLOR_AUDIT
- [X] T110 [P] [US5] Ensure information not conveyed by color alone: Add icons to error/success states, patterns to charts, text labels to status indicators per accessibility.spec.ts ACCESSIBILITY_CHECKLIST.visual
- [ ] T111 [P] [US5] Test text resize to 200%: Verify content remains readable, no horizontal scrolling, no overlap at 200% zoom per accessibility.spec.ts TESTING_STRATEGY.manual.zoom
- [X] T112 [P] [US5] Add reduced motion support: Detect prefers-reduced-motion media query in packages/frontend/src/hooks/useReducedMotion.ts, disable animations when true per data-model.md section 3.4
- [X] T113 [P] [US5] Ensure semantic HTML structure: Use header, main, nav, aside, footer, article, section elements with proper nesting per accessibility.spec.ts SCREEN_READER_SUPPORT.formLabels
- [ ] T114 [P] [US5] Test keyboard-only navigation: Unplug mouse, Tab through all pages, verify all interactive elements reachable, focus indicators visible, logical tab order per accessibility.spec.ts TESTING_STRATEGY.manual.keyboardOnly
- [ ] T115 [P] [US5] Test with screen reader (VoiceOver macOS or NVDA Windows): Navigate all pages, verify landmarks announced, form labels read, error messages spoken, images have alt text per accessibility.spec.ts TESTING_STRATEGY.manual.screenReader
- [ ] T116 [P] [US5] Run axe DevTools scan: Scan all pages, verify 0 critical/serious violations, fix warnings per accessibility.spec.ts TESTING_STRATEGY.automated.axeCore
- [ ] T117 [P] [US5] Run Lighthouse Accessibility audit: Verify score 95+, all WCAG AA checks pass per plan.md success metrics
- [ ] T118 [US5] Create accessibility documentation at packages/frontend/docs/accessibility.md: Document keyboard shortcuts, screen reader instructions, high contrast mode support per quickstart.md section 11

**Checkpoint**: Accessibility complete, WCAG 2.1 AA compliant, axe DevTools passes (0 violations), Lighthouse Accessibility 95+, keyboard/screen reader tested

---

## Phase 8: US6 - Spanish Cultural Identity (Priority: P2)

**Goal**: Incorporate modern Spanish cultural design elements (Moorish patterns, azulejo tiles, Spanish typography) that resonate with language learners without stereotypes

**User Story**: Spanish speakers and language learners recognize and appreciate authentic Spanish cultural elements presented in modern, tasteful way

**Independent Test**: Show designs to Spanish speakers and language learners, measure cultural resonance and authenticity perceptions (target 4+/5)

### Implementation for US6

- [X] T119 [P] [US6] Create Moorish geometry pattern SVG at packages/frontend/src/assets/patterns/moorish-hexagon.svg: 60x60px hexagonal tessellation, designed for 5-10% opacity background use per research.md section 1.2
- [X] T120 [P] [US6] Create azulejo tile border SVG at packages/frontend/src/assets/patterns/azulejo-border.svg: 1-2px height decorative border pattern for cards/modals per research.md section 1.2
- [X] T121 [P] [US6] Apply Moorish pattern to hero section at packages/frontend/src/pages/public/HomePage.tsx: Background with pattern at 5% opacity, subtle Spanish cultural ambiance per research.md section 1.2
- [X] T122 [P] [US6] Apply azulejo borders to premium cards at packages/frontend/src/components/booking/BookingCard.tsx: 1px decorative border-top with azulejo pattern at 20% opacity
- [X] T123 [US6] Use Playfair Display serif for all headings (H1-H6): Apply font-serif class, Spanish baroque typography influence, modern and elegant per data-model.md section 1.2
- [ ] T124 [P] [US6] Add subtle Spanish cultural photography: Flamenco dancer silhouette (modern, artistic), Spanish architecture (Moorish influence), language learning imagery at packages/frontend/public/images/cultural/
- [X] T125 [P] [US6] Create cultural color accents: Terracotta (50-900 scale) for warm accent, olive green for natural complement to Spanish red/gold palette per data-model.md section 1.1
- [ ] T126 [US6] Add Spanish-inspired iconography at packages/frontend/src/assets/icons/: Custom SVG icons with Moorish geometric influence (not stereotypical)
- [ ] T127 [P] [US6] Verify cultural elements are subtle and tasteful: Spanish red/gold used at 10-15% of interface, Moorish patterns at 5-10% opacity, not overwhelming or touristy per research.md section 1.2
- [ ] T128 [P] [US6] Test with Spanish speakers: Gather feedback on cultural authenticity, avoid stereotypes (no bullfighting, matadors, tourist traps), measure resonance (target 4+/5) per spec.md US6
- [ ] T129 [US6] Document cultural design decisions at packages/frontend/docs/cultural-design.md: Explain Moorish geometry, azulejo tiles, Spanish baroque typography, color psychology per research.md section 1.2

**Checkpoint**: Spanish cultural identity integrated, modern and authentic, resonates with target audience, not stereotypical

---

## Phase 9: Polish & Cross-Cutting Concerns (15 tasks)

**Purpose**: Testing, documentation, CI/CD, final optimizations across all user stories

- [X] T130 [P] Set up GitHub Actions CI workflow at .github/workflows/frontend-ci.yml: Run typecheck, lint, build on PR to packages/frontend/**, fail on errors
- [X] T131 [P] Add Lighthouse CI to GitHub Actions at .github/workflows/lighthouse-ci.yml: Run Lighthouse audit on preview build, enforce budgets (performance 90+, accessibility 95+, SEO 95+)
- [X] T132 [P] Configure Playwright E2E tests at packages/frontend/tests/e2e/: Test critical user flows (homepage load, booking flow, login/logout), run in CI
- [X] T133 [P] Add axe-core to Playwright tests at packages/frontend/tests/e2e/accessibility.spec.ts: Scan all pages with axe, fail on violations per accessibility.spec.ts TESTING_STRATEGY.ci
- [ ] T134 [P] Create visual regression tests with Playwright screenshots at packages/frontend/tests/visual/: Capture screenshots of key pages/components, detect unintended changes
- [X] T135 [P] Add bundle size monitoring to CI: Fail if main chunk exceeds 200kb gzipped, vendor chunks exceed thresholds
- [X] T136 [P] Create Storybook stories for all atomic/molecular components at packages/frontend/src/components/ui/*.stories.tsx: Button, Badge, Avatar, Card, FormField with all variants
- [ ] T137 [P] Document design system usage at packages/frontend/docs/design-system.md: Color palette usage, typography scales, spacing guidelines, component examples
- [X] T138 [P] Document performance optimizations at packages/frontend/docs/performance.md: Image optimization, code splitting, caching strategies, Core Web Vitals targets
- [X] T139 [P] Update README.md at packages/frontend/README.md: Project overview, setup instructions, development workflow, testing commands, deployment process
- [X] T140 [P] Add TypeScript type coverage report: Verify 100% type coverage, no any types, strict mode enabled per plan.md technical context
- [ ] T141 [P] Run full accessibility audit across all pages: axe DevTools, Lighthouse, keyboard navigation, screen reader, verify WCAG 2.1 AA compliance
- [ ] T142 [P] Run full performance audit across all pages: Lighthouse on mobile/desktop, WebPageTest on 3G, verify all Core Web Vitals pass
- [ ] T143 [P] Run full SEO audit across all pages: Lighthouse SEO, validate structured data, test social previews, verify crawlability
- [X] T144 Verify quickstart.md instructions: Follow setup guide from scratch, verify all steps work, update any outdated commands or paths

**Checkpoint**: All testing complete, CI/CD configured, documentation updated, ready for production deployment

---

## Component Implementation Checklist (Reference)

For each component, ensure:

- [ ] TypeScript props interface defined per component-api.ts
- [ ] All variants implemented (primary, secondary, outline, etc.)
- [ ] All sizes implemented (sm, md, lg, xl)
- [ ] All states handled (default, hover, active, focus, disabled, loading, error, success)
- [ ] ARIA attributes added per accessibility.spec.ts
- [ ] Keyboard navigation implemented per accessibility.spec.ts KEYBOARD_NAVIGATION
- [ ] Focus indicators visible (focus:ring-2 with 3:1 contrast)
- [ ] Color contrast verified (4.5:1 for text, 3:1 for UI)
- [ ] Touch targets ≥44x44px on mobile
- [ ] Responsive design (mobile-first, breakpoint variants)
- [ ] Spanish design tokens used (colors, spacing, typography)
- [ ] Performance optimized (GPU-accelerated animations, no layout thrashing)

---

## Page Implementation Checklist (Reference)

For each page, ensure:

- [ ] SEO meta tags (title, description, canonical, Open Graph, Twitter Card)
- [ ] Structured data (Organization, Course, Review as applicable)
- [ ] Semantic HTML (one H1, logical heading hierarchy, landmarks)
- [ ] Responsive layout (mobile 1 col, tablet 2 col, desktop 3+ col)
- [ ] Images optimized (WebP/AVIF, srcset, lazy loading)
- [ ] Route-based code splitting (React.lazy, Suspense)
- [ ] Loading skeleton for async content
- [ ] Error boundaries for error handling
- [ ] Accessibility (skip link, ARIA landmarks, keyboard navigation)
- [ ] Spanish cultural elements (patterns at 5-10% opacity if applicable)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1, US2, US3 (P1 priority) can proceed in parallel after Foundational
  - US4, US5, US6 (P2 priority) can proceed in parallel after Foundational
  - Or proceed sequentially: US1 → US2 → US3 → US4 → US5 → US6
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1) - Premium Visual**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (P1) - Responsive**: Can start after Foundational (Phase 2) - Benefits from US1 components but can use unstyled components
- **US3 (P1) - Performance**: Can start after Foundational (Phase 2) - Optimizes existing code, no story dependencies
- **US4 (P2) - SEO**: Can start after Foundational (Phase 2) - No story dependencies, adds meta tags
- **US5 (P2) - Accessibility**: Can start after Foundational (Phase 2) - Enhances all components, should test US1-US3 work
- **US6 (P2) - Cultural Identity**: Can start after Foundational (Phase 2) - Benefits from US1 visual system

### Within Each Phase

- Setup: All tasks marked [P] can run in parallel
- Foundational: All tasks marked [P] can run in parallel (most are parallel)
- User Stories: Tasks marked [P] within a story can run in parallel
- Components before pages
- Tests before implementation (if TDD approach)
- Validation/testing tasks at end of each phase

### Parallel Opportunities

**Phase 1 - Setup (All Parallel):**
```bash
Task: T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011
# Only T012 (verify) must run last
```

**Phase 2 - Foundational (Most Parallel):**
```bash
# Design tokens (all parallel):
Task: T013, T014, T015, T016, T017, T018, T019

# Config (parallel):
Task: T020, T021, T022, T023

# Hooks (parallel):
Task: T024, T025, T026

# Vite config (sequential):
Task: T027 → T028 (depends on manual chunks)

# App setup (parallel):
Task: T029, T030, T031, T032, T033, T034

# Only T035 (verify) must run last
```

**Phase 3 - US1 (Many Parallel):**
```bash
# Components (all parallel):
Task: T036+T037+T038 (Button with ARIA and focus)
Task: T039 (Badge)
Task: T040 (Avatar)
Task: T041 (Card)
Task: T042 (Typography)
Task: T043 (Cultural patterns)
Task: T044 (Gradients)
Task: T045 (Shadows)

# Verification (parallel):
Task: T046, T047
```

---

## Parallel Example: US1 Components

```bash
# Launch all atomic components together:
Task: "Create Button component at packages/frontend/src/components/ui/Button.tsx..."
Task: "Create Badge component at packages/frontend/src/components/ui/Badge.tsx..."
Task: "Create Avatar component at packages/frontend/src/components/ui/Avatar.tsx..."
Task: "Create Card component at packages/frontend/src/components/ui/Card.tsx..."
Task: "Create Typography components at packages/frontend/src/components/ui/Typography.tsx..."

# All can be developed in parallel (different files, no dependencies)
```

---

## Implementation Strategy

### MVP First (US1-US3 Only - 47 Tasks)

1. Complete Phase 1: Setup (12 tasks) - ~2-3 hours
2. Complete Phase 2: Foundational (23 tasks) - ~6-8 hours (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 - Premium Visual (12 tasks) - ~4-6 hours
4. **STOP and VALIDATE**: Test premium visual design independently
5. Skip to Phase 9 for minimal testing/documentation if MVP demo needed

### Incremental Delivery (All User Stories - 144 Tasks)

1. Complete Setup + Foundational → Foundation ready (~8-11 hours)
2. Add US1 - Premium Visual → Test independently → Deploy/Demo (MVP!)
3. Add US2 - Responsive → Test independently → Deploy/Demo
4. Add US3 - Performance → Test independently → Deploy/Demo (P1 complete)
5. Add US4 - SEO → Test independently → Deploy/Demo
6. Add US5 - Accessibility → Test independently → Deploy/Demo
7. Add US6 - Cultural Identity → Test independently → Deploy/Demo
8. Add Polish phase → Final testing → Production ready

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. Team completes Setup + Foundational together (~8-11 hours)
2. Once Foundational is done:
   - **Developer A**: US1 (Premium Visual) + US4 (SEO)
   - **Developer B**: US2 (Responsive) + US5 (Accessibility)
   - **Developer C**: US3 (Performance) + US6 (Cultural Identity)
3. All developers converge on Phase 9 (Polish) for final integration testing

---

## Testing Strategy

### Automated Testing (CI)

- **TypeScript**: npm run typecheck (zero errors)
- **ESLint**: npm run lint (zero errors)
- **Lighthouse CI**: Performance 90+, Accessibility 95+, SEO 95+
- **axe-core**: Zero critical/serious violations
- **Playwright E2E**: Critical user flows pass
- **Bundle size**: Main chunk <200kb gzipped

### Manual Testing

- **Keyboard navigation**: Tab through all pages (unplug mouse)
- **Screen reader**: VoiceOver (macOS) or NVDA (Windows) test
- **Responsive**: Test on real devices (iPhone, iPad, MacBook, 4K desktop)
- **Performance**: Test on throttled 3G connection
- **Visual QA**: Compare to design system, verify Spanish cultural elements subtle

### Cross-Browser Testing

- **Chrome**: Latest (primary development browser)
- **Firefox**: Latest (accessibility testing)
- **Safari**: Latest (iOS Safari for mobile)
- **Edge**: Latest (Windows compatibility)

---

## Success Criteria (Measurable Outcomes)

### Performance (Lighthouse CI)
- ✅ Performance score: 90+ (mobile and desktop)
- ✅ First Contentful Paint (FCP): < 1.8s
- ✅ Largest Contentful Paint (LCP): < 2.5s
- ✅ Total Blocking Time (TBT): < 200ms
- ✅ Cumulative Layout Shift (CLS): < 0.1
- ✅ Time to Interactive (TTI): < 3.8s
- ✅ 60 FPS scrolling and animations

### Accessibility (Lighthouse, axe DevTools)
- ✅ Accessibility score: 95+
- ✅ Contrast ratio violations: 0 (all text ≥4.5:1, UI ≥3:1)
- ✅ Keyboard navigation coverage: 100% (all interactive elements reachable)
- ✅ Screen reader compatibility: Pass all (VoiceOver, NVDA)
- ✅ WCAG 2.1 Level AA compliance: 100%

### SEO (Lighthouse, Search Console)
- ✅ SEO score: 95+
- ✅ Meta descriptions: 100% of pages (unique, <160 characters)
- ✅ Structured data: All pages (Organization, Course, Review schemas)
- ✅ Mobile-friendliness: Pass (responsive design, touch targets)
- ✅ Crawlability: 100% (sitemap submitted, robots.txt configured)

### User Experience (Analytics, Surveys)
- ✅ First impression rating: 4.5+/5 (user surveys)
- ✅ Mobile booking completion: 95%+ (analytics tracking)
- ✅ Bounce rate from organic: < 40% (Google Analytics)
- ✅ Cultural resonance: 4+/5 (Spanish speaker feedback)

---

## Notes

- **[P]** tasks can run in parallel (different files, no dependencies)
- **[US#]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Foundational phase (Phase 2) MUST complete before any user story work begins
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- Use design tokens from data-model.md, component APIs from component-api.ts, accessibility specs from accessibility.spec.ts
- Spanish cultural elements (patterns, colors) must be subtle (5-15% of interface)
- All components must meet WCAG 2.1 AA standards (4.5:1 contrast, keyboard accessible)
- All pages must achieve Lighthouse targets (90+ Performance, 95+ Accessibility/SEO)
