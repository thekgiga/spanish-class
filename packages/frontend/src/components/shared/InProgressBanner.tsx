/**
 * InProgressBanner — sticky amber banner shown across all admin pages
 * while a lesson is IN_PROGRESS.  Uses requested-status tokens (amber)
 * to signal attention without alarm.
 *
 * Rendered by DashboardLayout when a slotId is stored in session storage.
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInProgressSession } from '@/hooks/useInProgressSession';

export function InProgressBanner() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { session, clearSession } = useInProgressSession();

  if (!session) return null;

  const { slotId, studentName, startedAt } = session;

  // Compute elapsed time
  const elapsedMs = Date.now() - startedAt;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const elapsedStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 px-4 py-2.5',
        'bg-status-requested-surface border-b border-status-requested-border',
        'text-status-requested-foreground text-small',
      )}
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />

      <span className="flex-1 min-w-0 truncate">
        <span className="font-semibold">{t('session.banner_title')}</span>
        {studentName && <span className="mx-1">·</span>}
        {studentName && <span>{studentName}</span>}
        <span className="mx-1">·</span>
        <span>{t('session.banner_elapsed', { time: elapsedStr })}</span>
      </span>

      <button
        type="button"
        onClick={() => navigate(`/admin/session/${slotId}`)}
        className={cn(
          'shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-ui-xs text-small font-semibold',
          'bg-status-requested-foreground text-status-requested-surface',
          'hover:opacity-90 transition-opacity duration-micro',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        )}
      >
        {t('session.banner_return')}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={clearSession}
        aria-label={t('session.banner_dismiss')}
        className={cn(
          'shrink-0 p-1 rounded-ui-xs text-status-requested-foreground/70',
          'hover:text-status-requested-foreground hover:bg-status-requested-border/30',
          'transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
