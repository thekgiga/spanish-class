/**
 * SessionNoteSection — an expandable note card for one type of class note.
 * Auto-saves via parent callback on every keystroke (debounced upstream).
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

interface SessionNoteSectionProps {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  defaultExpanded?: boolean;
}

export function SessionNoteSection({
  id,
  label,
  hint,
  icon: Icon,
  value,
  onChange,
  defaultExpanded = true,
}: SessionNoteSectionProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded || !!value);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-expand when content is added programmatically
  React.useEffect(() => {
    if (value && !expanded) setExpanded(true);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-grow textarea
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
  }, [value, expanded]);

  const headerId = `${id}-header`;
  const panelId = `${id}-panel`;

  return (
    <div className="rounded-ui-md border border-line bg-surface overflow-hidden">
      {/* Section header — acts as disclosure button */}
      <button
        type="button"
        id={headerId}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'flex items-center gap-2 w-full px-4 py-3 text-left',
          'hover:bg-surface-raised transition-colors duration-micro',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
        <span className="flex-1 text-small font-semibold text-ink">{label}</span>
        {hint && !expanded && (
          <span className="text-caption text-ink-tertiary truncate max-w-48 hidden sm:block">{hint}</span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-ink-tertiary transition-transform duration-standard',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {/* Panel */}
      {expanded && (
        <div id={panelId} role="region" aria-labelledby={headerId} className="px-4 pb-4">
          {hint && (
            <p className="text-caption text-ink-tertiary mb-2">{hint}</p>
          )}
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full resize-none rounded-ui-sm border border-line px-3 py-2.5',
              'bg-canvas text-body text-ink placeholder:text-ink-tertiary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-transparent',
              'transition-colors duration-micro',
              'min-h-touch',
            )}
            rows={4}
          />
        </div>
      )}
    </div>
  );
}
