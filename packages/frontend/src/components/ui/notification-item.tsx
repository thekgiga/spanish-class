import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/hooks/useNotifications";

export interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  /** compact=true keeps body clipped to 2 lines (used in the bell popover) */
  compact?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationItem({
  notification: n,
  onMarkRead,
  compact = false,
}: NotificationItemProps) {
  const { t } = useTranslation("common");
  const isUnread = !n.readAt;

  const titleEl = (
    <p className={cn("text-small text-ink leading-snug", isUnread && "font-semibold")}>
      {n.title}
    </p>
  );

  const bodyEl = (
    <p className={cn("text-caption text-ink-secondary mt-0.5", compact && "line-clamp-2")}>
      {n.body}
    </p>
  );

  const timeEl = (
    <p className="text-micro text-ink-tertiary mt-1">{timeAgo(n.createdAt)}</p>
  );

  return (
    <div
      role="listitem"
      className={cn(
        "flex items-start gap-3 px-4 py-3 border-b border-line last:border-0",
        isUnread && "bg-surface-raised border-l-2 border-l-brand",
      )}
    >
      <div className="flex-1 min-w-0">
        {titleEl}
        {bodyEl}
        {timeEl}
      </div>

      {isUnread && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
          aria-label={t("notifications.mark_as_read")}
          className="shrink-0 p-1 rounded-ui-xs hover:bg-surface-muted text-ink-tertiary hover:text-ink mt-0.5 transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
