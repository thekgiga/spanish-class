import { useEffect, useRef, useState, useCallback } from "react";
import api from "@/lib/api";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // Load initial notifications from REST
  useEffect(() => {
    api
      .get<{ data: { notifications: AppNotification[] } }>("/notifications")
      .then((res) => setNotifications(res.data.data.notifications))
      .catch(() => {});
  }, []);

  // Open SSE stream
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // EventSource doesn't support custom headers; pass token via query param
    // The backend's authenticate middleware reads cookies or Authorization header.
    // Since EventSource uses GET with cookies, and we have an httpOnly cookie set
    // on login, this should work without a token param in same-origin contexts.
    const es = new EventSource("/api/notifications/stream", { withCredentials: true });
    esRef.current = es;

    es.addEventListener("connected", () => setConnected(true));

    es.addEventListener("notification", (e: Event) => {
      try {
        const notification: AppNotification = JSON.parse((e as MessageEvent).data);
        setNotifications((prev) => [notification, ...prev].slice(0, 50));
      } catch {/* ignore parse error */}
    });

    es.onerror = () => {
      setConnected(false);
      // Browser auto-reconnects on error
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markRead = useCallback(async (id: string) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await api.post("/notifications/read-all").catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
  }, []);

  return { notifications, unreadCount, connected, markRead, markAllRead };
}
