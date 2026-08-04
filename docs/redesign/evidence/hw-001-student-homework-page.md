# Frontend Change Evidence

## Scope

- Requirement IDs: HW-001
- Roles: Student (read-only consumer); Professor (write side unchanged)
- Routes: `/dashboard/homework` (student, authenticated non-admin)
- BPMN sections: §8 Post-session student review — student accesses homework assigned during completed lessons
- API changes: `GET /api/student/bookings/:id/notes` (security fix), `GET /api/student/homework` (new)

## Before

Students had no dedicated page for homework. The only homework surface was an inline card in `BookingsPage` history tab — one `homeworkNotes` field per completed booking, buried in the lesson history list. Critically, `GET /api/student/bookings/:id/notes` returned `sessionNotes` and `agendaNotes` alongside `homeworkNotes`, exposing professor-internal note fields to students.

## After

A dedicated `/dashboard/homework` page (linked from the student sidebar as "Homework" with `GraduationCap` icon) shows all homework assignments across completed lessons, newest first. Each card shows: lesson date, professor name, the homework text, and last-updated timestamp.

The API security issue is resolved: `GET /api/student/bookings/:id/notes` now returns only `homeworkNotes` (plus `id`, `createdAt`, `updatedAt`). The new `GET /api/student/homework` endpoint also selects `homeworkNotes` only — `sessionNotes`, `agendaNotes`, and `studentObservation` are never fetched or returned on any student-facing endpoint.

## State coverage

- [x] loading — `PageHeader` renders above three `SkeletonCard` placeholders during fetch
- [x] empty — `EmptyState` with `BookOpen` icon, title, and description when no homework exists
- [x] success — list of `Card` components, one per lesson with homework, newest first
- [x] error/retry — `InlineAlert variant="error"` with localized error message; page stays mounted
- [x] disabled — nav item not shown to admin (professor) users; route redirects admins to `/admin`
- [x] permission/expiry — unauthenticated requests redirect to `/auth` (ProtectedRoute)

## Responsive evidence

Live screenshots captured via Playwright against Docker Compose stack (`http://localhost`).
All screenshots in `docs/redesign/evidence/screenshots/hw-001/`.

- [x] 390px — single column; metadata row wraps (`flex-wrap`) — date on first line, professor on second. No horizontal scroll. Mobile topbar + hamburger nav. `homework-390.png`
- [x] 768px — same single-column layout, wider card, comfortable reading density. Mobile topbar. `homework-768.png`
- [x] 1280px — persistent sidebar with Homework nav item highlighted; `max-w-2xl` content centred in main area. `homework-1280.png`
- [x] 1440px — same as 1280px, more breathing room on either side. `homework-1440.png`
- [x] Sidebar at 390px — mobile drawer open; `GraduationCap` + "Homework" text visible between "My Lessons" and "Profile". `sidebar-390.png`
- [x] Sidebar at 1280px — persistent sidebar; Homework item uses brand active state when on the page. `sidebar-1280.png`

## Accessibility evidence

- `PageHeader` renders an `<h1>` — present in both loading and loaded states
- All decorative icons carry `aria-hidden="true"` (Calendar, User, BookOpen, GraduationCap)
- Nav item has text label ("Homework") alongside the icon — no icon-only action
- `InlineAlert variant="error"` uses `role="alert"` / `aria-live="assertive"` for screen-reader announcement
- `EmptyState` accessible: heading and description text visible; no color-only communication
- Keyboard: all nav items reachable via Tab; `GraduationCap` nav link follows `SideNavItem` pattern with `focus-visible:ring-2 focus-visible:ring-focus`

## Localization evidence

9 keys added under `student.homework.*` in all three locales (including `section_label` added after visual review):

| Key | en | sr | es |
|---|---|---|---|
| `page_title` | Homework | Domaći zadatak | Tarea |
| `page_subtitle` | Review assignments left by your professor… | Pregledajte zadatke… | Revisa las tareas… |
| `section_label` | Homework | Domaći zadatak | Tarea |
| `empty_title` | No homework yet | Nema domaćih zadataka | Sin tarea aún |
| `empty_description` | Homework assigned after completed lessons… | Domaći zadaci dodeljeni… | Las tareas asignadas… |
| `from_lesson_on` | Lesson on {{date}} | Čas od {{date}} | Clase del {{date}} |
| `with_professor` | with {{name}} | sa {{name}} | con {{name}} |
| `updated` | Updated {{date}} | Ažurirano {{date}} | Actualizado {{date}} |
| `error` | Could not load homework. Please try again. | Domaći zadaci nisu dostupni… | No se pudo cargar la tarea… |

`navigation.homework` added to `en/sr/es` `common.json`:

| Locale | Value |
|---|---|
| en | Homework |
| sr | Domaći zadatak |
| es | Tarea |

## Automated verification

### TypeScript
`npm --prefix packages/frontend run typecheck` — **0 errors**

### Lint
`npm --prefix packages/frontend run lint` — **0 errors** (125 pre-existing warnings, none in changed files; also fixed pre-existing broken `calendar-event.stories.tsx` parse error from prior commit)

### Production build
`npm --prefix packages/frontend run build` — **clean** (`✓ built in 3.76s`)

### UI-system canonical files
All 5 required files confirmed present:
- `docs/ui-system/design-tokens.json` ✓
- `packages/frontend/src/styles/ui-system.tokens.css` ✓
- `packages/frontend/ui-system.tailwind.extend.cjs` ✓
- `packages/frontend/src/lib/ui-system/status.ts` ✓
- `.claude/skills/spanish-class-ui-system/SKILL.md` ✓

### Changed-line guardrails (manual — check-ui-system.mjs blocked by hook)
Grepped changed student-facing files for forbidden patterns:
- No raw hex/RGB/HSL values in `HomeworkPage.tsx`
- No `edu-*` legacy tokens
- No arbitrary Tailwind values (`mt-[...]`, etc.)
- No professor-only fields (`sessionNotes`, `agendaNotes`, `studentObservation`) in `HomeworkPage.tsx` or student-facing `api.ts` methods

### Backend security unit tests
`npx vitest run packages/backend/tests/unit/student-homework-security.test.ts` — **6/6 passed**
- `select` objects verified to exclude `sessionNotes`, `agendaNotes`, `studentObservation`
- Response shape verification (assembled result never contains professor fields)
- Cross-student isolation: booking ownership scoped to `studentId`, homework query scoped to `studentId`

### E2E tests (live Docker stack)
`npx playwright test --config tests/e2e/baseline/playwright.baseline.config.ts homework.spec.ts` — **6/6 passed**
1. Student can navigate to `/dashboard/homework` ✓
2. Heading renders in all states (loading/empty/populated) ✓
3. Unauthenticated redirected to `/auth` ✓
4. Professor redirected to `/admin` ✓
5. `GET /api/student/homework` response excludes professor-only fields (live API assertion against running stack) ✓
6. Homework nav link visible in student sidebar ✓

## Visual design reviewer decision

**PASS WITH OBSERVATIONS** (`visual-design-reviewer` agent run against live screenshots).

All token, typography, density, icon, and responsive checks passed. Two non-blocking observations:

- Section label was using `page_title` key — **fixed**: dedicated `section_label` key added to all 3 locales
- `GraduationCap` (nav) vs `BookOpen` (card content) — intentional split (wayfinding vs. content glyph), accepted

## UI/UX reviewer decision

**PASS WITH DEFERRED GAPS** (from earlier `ui-ux-reviewer` run — all blocking items since resolved):
- Security field exclusion ✓
- Matrix row ✓
- Loading state preserves `PageHeader` ✓

## Storybook stories

`packages/frontend/src/pages/student/HomeworkPage.stories.tsx` — 5 stories:
- `Populated` — three homework cards, newest first (QueryClient pre-seeded)
- `Empty` — empty state
- `WithError` — error alert
- `SingleItem` — one card, no professor (null professor field)
- `LongHomeworkText` — extended multi-section homework text

## Screenshots

| State | 390px | 768px | 1280px | 1440px |
|---|---|---|---|---|
| Homework page (populated) | `homework-390.png` ✓ | `homework-768.png` ✓ | `homework-1280.png` ✓ | `homework-1440.png` ✓ |
| Sidebar (Homework nav visible) | `sidebar-390.png` ✓ | `sidebar-768.png` ✓ | `sidebar-1280.png` ✓ | `sidebar-1440.png` ✓ |

All 8 screenshots at `docs/redesign/evidence/screenshots/hw-001/`.

## Remaining limitations

- Date localization: `format()` calls use English date-fns formatting regardless of UI language — pre-existing pattern across all pages, not a regression introduced here
- Live responsive screenshots show the seeded homework item (one completed lesson with homework in the test database); empty-state screenshot requires a student with no completed homework
