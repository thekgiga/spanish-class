import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/ui/notification-item";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { SEOMeta } from "@/components/shared/SEOMeta";

interface NotificationGroup {
  label: string;
  items: AppNotification[];
}

function groupByDate(notifications: AppNotification[]): NotificationGroup[] {
  const map = new Map<string, AppNotification[]>();
  for (const n of notifications) {
    const date = new Date(n.createdAt);
    const key = isToday(date)
      ? "__today__"
      : isYesterday(date)
      ? "__yesterday__"
      : format(date, "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }

  return Array.from(map.entries()).map(([key, items]) => ({
    label:
      key === "__today__"
        ? "Today"
        : key === "__yesterday__"
        ? "Yesterday"
        : format(new Date(key), "MMMM d"),
    items,
  }));
}

export function NotificationsPage() {
  const { t } = useTranslation("common");
  const {
    notifications,
    unreadCount,
    hasMore,
    loadingMore,
    markRead,
    markAllRead,
    loadMore,
  } = useNotifications();

  const loading = notifications.length === 0 && !hasMore;
  const groups = useMemo(() => groupByDate(notifications), [notifications]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <SEOMeta title={t("notifications.page_title")} description={t("notifications.page_description")} />

      <PageHeader
        title={t("notifications.page_title")}
        description={t("notifications.page_description")}
        action={
          unreadCount > 0 ? (
            <Button variant="quiet" size="sm" onClick={markAllRead}>
              {t("notifications.mark_all_read")}
            </Button>
          ) : undefined
        }
      />

      {/* Loading skeletons — shown only on first load */}
      {loading && notifications.length === 0 && (
        <div className="space-y-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-ui-sm" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title={t("notifications.empty")}
            description={t("notifications.page_description")}
          />
        </div>
      )}

      {/* Date-grouped list */}
      {notifications.length > 0 && (
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <section key={group.label}>
              <p className="text-caption text-ink-tertiary uppercase tracking-wide font-semibold mb-2 px-1">
                {group.label}
              </p>
              <div
                role="list"
                className="rounded-ui-md border border-line overflow-hidden bg-surface shadow-ui-1"
              >
                {group.items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={markRead}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                size="sm"
                isLoading={loadingMore}
                onClick={loadMore}
              >
                {t("notifications.load_more")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
