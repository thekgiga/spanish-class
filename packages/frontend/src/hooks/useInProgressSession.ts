/**
 * useInProgressSession — lightweight session-storage hook that tracks
 * whether the professor currently has an in-progress class session open.
 *
 * Stored in sessionStorage so it survives page refreshes within the tab
 * but is cleared automatically when the tab is closed.
 */
import * as React from 'react';

const STORAGE_KEY = 'spanish-class:in-progress-session';

export interface InProgressSessionData {
  slotId: string;
  studentName?: string;
  startedAt: number; // unix ms
}

function readSession(): InProgressSessionData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InProgressSessionData) : null;
  } catch {
    return null;
  }
}

function writeSession(data: InProgressSessionData): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function removeSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function useInProgressSession() {
  const [session, setSession] = React.useState<InProgressSessionData | null>(readSession);

  const startSession = React.useCallback((data: InProgressSessionData) => {
    writeSession(data);
    setSession(data);
  }, []);

  const clearSession = React.useCallback(() => {
    removeSession();
    setSession(null);
  }, []);

  // Keep elapsed time ticking — re-render every second while a session is active
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!session) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  return { session, startSession, clearSession };
}
