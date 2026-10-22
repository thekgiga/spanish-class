import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { type UseFormReturn } from 'react-hook-form';
import type { ConsultationFormData } from './MultiStepConsultationForm';

const SERVICES = [
  { key: 'conversation', icon: '💬' },
  { key: 'grammar', icon: '📖' },
  { key: 'business', icon: '🏢' },
  { key: 'cultural', icon: '🎭' },
  { key: 'exam', icon: '🏆' },
] as const;

type ServiceKey = typeof SERVICES[number]['key'];

interface StepServiceProps {
  form: UseFormReturn<ConsultationFormData>;
  headingId: string;
}

/**
 * Step 2 — Single-select service + intensity toggle.
 */
export function StepService({ form, headingId }: StepServiceProps) {
  const { t } = useTranslation('about');
  const { watch, setValue, formState: { errors } } = form;

  const selectedService = watch('service');
  const selectedIntensity = watch('intensity') ?? 'basic';

  function selectService(key: ServiceKey) {
    setValue('service', key, { shouldValidate: true });
  }

  function setIntensity(val: 'basic' | 'intensive') {
    setValue('intensity', val);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2
          id={headingId}
          className="text-2xl font-bold text-[hsl(var(--mkt-azahar))]"
        >
          {t('consultation.step2.title')}
        </h2>
        <p className="text-sm text-[hsl(var(--mkt-azahar)/0.7)]">
          {t('consultation.step2.subtitle')}
        </p>
      </div>

      {/* Service cards */}
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={errors.service ? 'service-error' : undefined}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {SERVICES.map(({ key, icon }) => {
          const isSelected = selectedService === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => selectService(key)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))] focus-visible:ring-offset-2',
                isSelected
                  ? [
                      'border-[hsl(var(--mkt-sol))]',
                      'bg-[hsl(var(--mkt-sol)/0.15)]',
                      'text-[hsl(var(--mkt-azahar))]',
                    ]
                  : [
                      'border-[hsl(var(--mkt-glass-border)/0.3)]',
                      'bg-[hsl(var(--mkt-glass-bg)/0.05)]',
                      'text-[hsl(var(--mkt-azahar)/0.7)]',
                      'hover:border-[hsl(var(--mkt-sol)/0.5)]',
                      'hover:bg-[hsl(var(--mkt-sol)/0.08)]',
                    ],
              )}
            >
              <span className="text-xl" aria-hidden="true">{icon}</span>
              <span className="text-sm font-medium">
                {t(`consultation.services.${key}`)}
              </span>
              {isSelected && (
                <span className="ml-auto text-[hsl(var(--mkt-sol))] text-sm" aria-hidden="true">
                  ●
                </span>
              )}
            </button>
          );
        })}
      </div>

      {errors.service && (
        <p id="service-error" role="alert" className="text-sm text-[hsl(var(--mkt-fiesta))]">
          {t('consultation.validation.service_required')}
        </p>
      )}

      {/* Intensity toggle */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--mkt-sol))]">
          Pace
        </p>
        <div
          role="radiogroup"
          aria-label="Learning pace"
          className="flex gap-2"
        >
          {(['basic', 'intensive'] as const).map((val) => {
            const isActive = selectedIntensity === val;
            return (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setIntensity(val)}
                className={cn(
                  'flex-1 rounded-lg py-2 px-4 text-sm font-medium transition-all duration-200',
                  'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))] focus-visible:ring-offset-2',
                  isActive
                    ? [
                        'border-[hsl(var(--mkt-mediterraneo))]',
                        'bg-[hsl(var(--mkt-mediterraneo)/0.2)]',
                        'text-[hsl(var(--mkt-azahar))]',
                      ]
                    : [
                        'border-[hsl(var(--mkt-glass-border)/0.3)]',
                        'text-[hsl(var(--mkt-azahar)/0.6)]',
                        'hover:border-[hsl(var(--mkt-mediterraneo)/0.4)]',
                      ],
                )}
              >
                {t(`consultation.intensity.${val}`)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
