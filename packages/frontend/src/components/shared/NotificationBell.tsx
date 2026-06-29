import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, BellDot, Check, CheckCheck, X, Loader2, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

function timeAgo(dateStr: string, t: TFunction): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return t("notifications.just_now");
  if (m < 60) return t("notifications.minutes_ago", { count: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t("notifications.hours_ago", { count: h });
  return t("notifications.days_ago", { count: Math.floor(h / 24) });
}

const PANEL_ID = "notification-panel";

export function NotificationBell() {
  const { t } = useTranslation("common");
  const { notifications, unreadCount, connected, hasMore, loadingMore, markRead, markAllRead, loadMore } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape closes the popover and returns focus to trigger
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const recent = notifications.slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unreadCount > 0
          ? `${t("notifications.title")} — ${t("notifications.unread_count", { count: unreadCount })}`
          : t("notifications.title")}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-haspopup="true"
        className="relative p-2 rounded-ui-sm hover:bg-surface-muted text-ink-tertiary hover:text-ink transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        {unreadCount > 0 ? (
          <BellDot className="w-5 h-5 text-brand" />
        ) : (
          <Bell className={cn("w-5 h-5", !connected && "text-feedback-warning")} />
        )}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 w-4 h-4 bg-feedback-danger rounded-full text-ink-inverse text-micro font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {!connected && unreadCount === 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-feedback-warning rounded-full" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={PANEL_ID}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-ui-md shadow-ui-2 border border-line z-50 overflow-hidden"
            role="dialog"
            aria-label={t("notifications.title")}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="text-small font-semibold text-ink">
                {t("notifications.title")}
                {unreadCount > 0 && (
                  <span className="ml-2 text-caption bg-alert-error-surface text-alert-error-foreground px-1.5 py-0.5 rounded-ui-full">
                    {unreadCount}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-caption text-ink-secondary hover:text-ink flex items-center gap-1 px-2 py-1 rounded-ui-xs hover:bg-surface-muted transition-colors duration-micro"
                  >
                    <CheckCheck className="w-3 h-3" aria-hidden="true" />
                    {t("notifications.mark_all_read")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
                  aria-label={t("actions.close")}
                  className="p-1 rounded-ui-xs hover:bg-surface-muted text-ink-tertiary hover:text-ink transition-colors duration-micro"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Reconnecting banner */}
            {!connected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-status-requested-surface border-b border-status-requested-border text-status-requested-foreground text-caption">
                <WifiOff className="w-3 h-3 shrink-0" aria-hidden="true" />
                {t("notifications.reconnecting")}
              </div>
            )}

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto" role="list" aria-label={t("notifications.title")}>
              {recent.length === 0 ? (
                <div className="py-8 text-center text-caption text-ink-tertiary">
                  {t("notifications.empty")}
                </div>
              ) : (
                recent.map((n: AppNotification) => (
                  <div
                    key={n.id}
                    role="listitem"
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-line last:border-0",
                      "hover:bg-surface-muted transition-colors duration-micro cursor-default",
                      !n.readAt && "bg-surface-raised",
                    )}
                    onClick={() => !n.readAt && markRead(n.id)}
                  >
                    <div className="flex-1 min-w-0">
                      {n.href ? (
                        <Link
                          to={n.href}
                          onClick={() => {
                            if (!n.readAt) markRead(n.id);
                            setOpen(false);
                          }}
                          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-ui-xs"
                        >
                          <p className={cn("text-small text-ink leading-snug", !n.readAt && "font-semibold")}>
                            {n.title}
                          </p>
                          <p className="text-caption text-ink-secondary mt-0.5 line-clamp-2">{n.body}</p>
                        </Link>
                      ) : (
                        <>
                          <p className={cn("text-small text-ink leading-snug", !n.readAt && "font-semibold")}>
                            {n.title}
                          </p>
                          <p className="text-caption text-ink-secondary mt-0.5 line-clamp-2">{n.body}</p>
                        </>
                      )}
                      <p className="text-micro text-ink-tertiary mt-1">{timeAgo(n.createdAt, t)}</p>
                    </div>
                    {!n.readAt && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        aria-label={t("notifications.mark_as_read")}
                        className="shrink-0 p-1 rounded-ui-xs hover:bg-surface-muted text-ink-tertiary hover:text-ink mt-0.5 transition-colors duration-micro"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="border-t border-line px-4 py-2 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-caption text-brand hover:text-brand-hover font-medium disabled:opacity-50 flex items-center gap-1 mx-auto transition-colors duration-micro"
                >
                  {loadingMore ? (
                    <><Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />{t("notifications.load_more")}…</>
                  ) : (
                    t("notifications.load_more")
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
