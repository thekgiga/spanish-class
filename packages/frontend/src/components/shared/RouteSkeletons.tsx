/**
 * RouteSkeletons — geometry-matched fallbacks for lazy-loaded routes.
 *
 * These sit inside the shell (DashboardLayout <Outlet />) so the sidebar and
 * topbar stay visible while a code-split page chunk is downloading. Each
 * skeleton mirrors the altitude/geometry of the page it stands in for, so the
 * visible → skeleton → real content transition never shifts layout or looks
 * like a generic "empty dashboard".
 *
 * Contract (docs/ui-system/06-component-contracts.md §Skeleton):
 * - matches the final layout geometry
 * - uses semantic tokens (surface-muted / line) — no palette classes
 * - decorative-only: aria-hidden via <Skeleton>
 */
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

// ── Student dashboard (StudentDashboard.tsx) ─────────────────────────────
//
// Layout: max-w-2xl centered column with:
//   • small caption
//   • hero card (Confirmed lesson) — badge row, time headline, professor, CTA row
//   • full-width primary button
//   • recent-activity list card
export function StudentDashboardSkeleton() {
  const { t } = useTranslation("common");
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("route_loading.dashboard")}</span>

      {/* Caption line */}
      <Skeleton className="h-3 w-28" />

      {/* Hero card */}
      <div className="rounded-ui-md border border-line bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-44 rounded-ui-sm" />
      </div>

      {/* Primary CTA */}
      <Skeleton className="h-11 w-full" />

      {/* Recent activity */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <div className="rounded-ui-md border border-line bg-surface divide-y divide-line">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Admin/professor shell (CalendarPage default) ─────────────────────────
//
// Layout: wide content area — header row + large calendar surface.
export function AdminShellSkeleton() {
  const { t } = useTranslation("common");
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("route_loading.generic")}</span>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-44" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-ui-sm" />
          <Skeleton className="h-9 w-24 rounded-ui-sm" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      {/* Calendar / grid */}
      <div className="rounded-ui-md border border-line bg-surface p-4">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 6 }).map((_, r) => (
            <div key={r} className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, c) => (
                <Skeleton key={c} className="h-16" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
