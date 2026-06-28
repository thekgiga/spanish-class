import { useEffect, useRef, useState, useCallback } from "react";
import { notificationApi } from "@/lib/api";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
}

const SSE_BASE_DELAY_MS = 1_000;
const SSE_MAX_DELAY_MS = 30_000;
const PAGE_SIZE = 20;

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // SSE reconnect state via refs so closures always see latest values
  const delayRef = useRef(SSE_BASE_DELAY_MS);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const intentionalCloseRef = useRef(false);

  // Load initial page of notifications from REST
  useEffect(() => {
    notificationApi
      .getNotifications(1, PAGE_SIZE)
      .then((res) => {
        setNotifications(res.data.notifications);
        setTotalPages(res.pagination.totalPages);
        setPage(1);
      })
      .catch(() => {});
  }, []);

  // N1: SSE stream with exponential backoff reconnect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    intentionalCloseRef.current = false;

    function connect() {
      const t = localStorage.getItem("token");
      if (!t || intentionalCloseRef.current) return;

      const es = new EventSource("/api/notifications/stream", { withCredentials: true });
      esRef.current = es;

      es.addEventListener("connected", () => {
        setConnected(true);
        delayRef.current = SSE_BASE_DELAY_MS; // reset backoff on success
      });

      es.addEventListener("notification", (e: Event) => {
        try {
          const notification: AppNotification = JSON.parse((e as MessageEvent).data);
          setNotifications((prev) => [notification, ...prev].slice(0, 100));
        } catch {
          // ignore parse errors
        }
      });

      es.onerror = () => {
        setConnected(false);
        es.close();
        esRef.current = null;
        if (!intentionalCloseRef.current) {
          const delay = delayRef.current;
          delayRef.current = Math.min(delay * 2, SSE_MAX_DELAY_MS);
          retryTimerRef.current = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      intentionalCloseRef.current = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      esRef.current?.close();
      esRef.current = null;
      setConnected(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markRead = useCallback(async (id: string) => {
    await notificationApi.markRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead().catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
  }, []);

  // N4: Load more (next page)
  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await notificationApi.getNotifications(nextPage, PAGE_SIZE);
      setNotifications((prev) => [...prev, ...res.data.notifications]);
      setPage(nextPage);
      setTotalPages(res.pagination.totalPages);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, totalPages]);

  const hasMore = page < totalPages;

  return {
    notifications,
    unreadCount,
    connected,
    hasMore,
    loadingMore,
    markRead,
    markAllRead,
    loadMore,
  };
}
