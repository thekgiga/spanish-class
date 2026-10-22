import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface FormProgressProps {
  currentStep: number; // 0, 1, 2
  totalSteps?: number;
}

/**
 * 3-step dot indicator with sol→fiesta gradient fill.
 * aria-current="step" on active step; WCAG 2.1-compliant.
 */
export function FormProgress({ currentStep, totalSteps = 3 }: FormProgressProps) {
  const { t } = useTranslation('about');

  const stepLabels = [
    t('consultation.step1.title'),
    t('consultation.step2.title'),
    t('consultation.step3.title'),
  ];

  // Progress bar width: 0% at step 0, 50% at step 1, 100% at step 2
  const progressPct = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100;

  return (
    <nav aria-label="Form progress" className="w-full">
      {/* Track + fill */}
      <div className="relative mb-4">
        {/* Track */}
        <div
          className="absolute top-[11px] left-0 right-0 h-0.5 bg-[hsl(var(--mkt-glass-border)/0.3)]"
          aria-hidden="true"
        />
        {/* Animated fill — sol → fiesta gradient */}
        <div
          className="absolute top-[11px] left-0 h-0.5 transition-all duration-500 ease-out"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(to right, hsl(var(--mkt-sol)), hsl(var(--mkt-fiesta)))',
          }}
          aria-hidden="true"
        />

        {/* Step dots */}
        <ol className="relative flex justify-between items-start">
          {stepLabels.map((label, i) => {
            const isPast = i < currentStep;
            const isActive = i === currentStep;

            return (
              <li
                key={i}
                className="flex flex-col items-center gap-2"
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Dot */}
                <span
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-bold transition-all duration-300',
                    isActive && [
                      'border-[hsl(var(--mkt-fiesta))]',
                      'text-[hsl(var(--mkt-fiesta))]',
                      'bg-[hsl(var(--mkt-fiesta)/0.15)]',
                      'scale-110',
                    ],
                    isPast && [
                      'border-[hsl(var(--mkt-sol))]',
                      'bg-[hsl(var(--mkt-sol))]',
                      'text-[hsl(var(--mkt-noche))]',
                    ],
                    !isActive && !isPast && [
                      'border-[hsl(var(--mkt-glass-border)/0.4)]',
                      'text-[hsl(var(--mkt-azahar)/0.4)]',
                    ],
                  )}
                >
                  {isPast ? '✓' : i + 1}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] font-medium uppercase tracking-wide text-center max-w-[80px] leading-tight',
                    isActive && 'text-[hsl(var(--mkt-azahar))]',
                    isPast && 'text-[hsl(var(--mkt-sol))]',
                    !isActive && !isPast && 'text-[hsl(var(--mkt-azahar)/0.4)]',
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
