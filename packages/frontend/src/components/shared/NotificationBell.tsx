import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, BellDot, Check, CheckCheck, X, Loader2, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, connected, hasMore, loadingMore, markRead, markAllRead, loadMore } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recent = notifications.slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        {unreadCount > 0 ? (
          <BellDot className="w-5 h-5 text-spanish-teal-600" />
        ) : (
          <Bell className={cn("w-5 h-5", !connected && "text-amber-500")} />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {/* N1: subtle offline indicator dot */}
        {!connected && unreadCount === 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
                  >
                    <CheckCheck className="w-3 h-3" />
                    All read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* N1: Reconnecting banner */}
            {!connected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs">
                <WifiOff className="w-3 h-3 flex-shrink-0" />
                Reconnecting to live updates…
              </div>
            )}

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                recent.map((n: AppNotification) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors",
                      !n.readAt && "bg-spanish-teal-50/40",
                    )}
                    onClick={() => !n.readAt && markRead(n.id)}
                  >
                    <div className="flex-1 min-w-0">
                      {n.href ? (
                        <Link
                          to={n.href}
                          onClick={() => { !n.readAt && markRead(n.id); setOpen(false); }}
                          className="block"
                        >
                          <p className={cn("text-sm text-slate-800 leading-snug", !n.readAt && "font-semibold")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                        </Link>
                      ) : (
                        <>
                          <p className={cn("text-sm text-slate-800 leading-snug", !n.readAt && "font-semibold")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                        </>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.readAt && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        className="flex-shrink-0 p-1 rounded hover:bg-slate-200 text-slate-400 mt-0.5"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* N4: Load more */}
            {hasMore && (
              <div className="border-t border-slate-100 px-4 py-2 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs text-spanish-teal-600 hover:text-spanish-teal-700 font-medium disabled:opacity-50 flex items-center gap-1 mx-auto"
                >
                  {loadingMore ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</>
                  ) : (
                    "Load more"
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
