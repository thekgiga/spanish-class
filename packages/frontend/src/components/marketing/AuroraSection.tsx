import { type ReactNode, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type BlobColor = 'fiesta' | 'sol' | 'mediterraneo' | 'violeta';

interface AuroraBlob {
  color: BlobColor;
  /** Tailwind size class e.g. "w-96 h-80" */
  size: string;
  /** Tailwind position classes e.g. "-top-20 -left-16" */
  position: string;
  opacity?: number;
}

type ScrimTone = 'dark' | 'light' | 'none';

interface Props {
  children: ReactNode;
  blobs?: AuroraBlob[];
  scrim?: ScrimTone;
  className?: string;
  as?: 'section' | 'div' | 'header';
}

/** Default 2-blob configuration (noche dark section) */
const DEFAULT_BLOBS: AuroraBlob[] = [
  { color: 'fiesta',       size: 'w-[480px] h-[360px]', position: '-top-24 -left-20',  opacity: 0.55 },
  { color: 'mediterraneo', size: 'w-[420px] h-[320px]', position: '-bottom-16 -right-16', opacity: 0.5 },
];

const scrimClasses: Record<ScrimTone, string> = {
  dark:  'bg-gradient-to-b from-[hsl(221_51%_16%/0.55)] to-[hsl(221_51%_16%/0.4)]',
  light: 'bg-gradient-to-b from-[hsl(42_68%_97%/0.8)] to-[hsl(42_68%_97%/0.6)]',
  none:  '',
};

/**
 * Section wrapper with 2 aurora blobs + optional scrim.
 * Perf budget: ≤2 blur() layers per viewport (enforced by default blob count).
 * @supports not (backdrop-filter): aurora blobs fall back to opacity-only (no blur).
 * Reduced motion: blobs rendered without animation; positions are static.
 */
export function AuroraSection({
  children,
  blobs = DEFAULT_BLOBS,
  scrim = 'dark',
  className,
  as: Tag = 'section',
}: Props) {
  return (
    <Tag className={cn('relative overflow-hidden', className)}>
      {/* Blob layer — max 2 for perf budget */}
      {blobs.slice(0, 2).map((blob, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={cn(
            'mkt-aurora-blob',
            `mkt-aurora-blob-${blob.color}`,
            blob.size,
            blob.position,
          )}
          style={{ opacity: blob.opacity ?? 0.5 } as CSSProperties}
        />
      ))}

      {/* Scrim */}
      {scrim !== 'none' && (
        <div aria-hidden="true" className={cn('absolute inset-0', scrimClasses[scrim])} />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
