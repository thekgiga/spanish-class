import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { type UseFormReturn } from 'react-hook-form';
import type { ConsultationFormData } from './MultiStepConsultationForm';

const GOALS = [
  { key: 'travel_culture', icon: '✈️' },
  { key: 'study_spain', icon: '🎓' },
  { key: 'exam_prep', icon: '📝' },
  { key: 'career', icon: '💼' },
  { key: 'personal_growth', icon: '🌱' },
] as const;

type GoalKey = typeof GOALS[number]['key'];

interface StepGoalsProps {
  form: UseFormReturn<ConsultationFormData>;
  headingId: string;
}

/**
 * Step 1 — Multi-select goal cards.
 * At least one must be selected (validated before advancing).
 */
export function StepGoals({ form, headingId }: StepGoalsProps) {
  const { t } = useTranslation('about');
  const { watch, setValue, formState: { errors } } = form;

  const selected: GoalKey[] = watch('goals') ?? [];

  function toggle(key: GoalKey) {
    const next = selected.includes(key)
      ? selected.filter((g) => g !== key)
      : [...selected, key];
    setValue('goals', next, { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2
          id={headingId}
          className="text-2xl font-bold text-[hsl(var(--mkt-azahar))]"
        >
          {t('consultation.step1.title')}
        </h2>
        <p className="text-sm text-[hsl(var(--mkt-azahar)/0.7)]">
          {t('consultation.step1.subtitle')}
        </p>
      </div>

      <div
        role="group"
        aria-labelledby={headingId}
        aria-describedby={errors.goals ? 'goals-error' : undefined}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {GOALS.map(({ key, icon }) => {
          const isSelected = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={isSelected}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))] focus-visible:ring-offset-2',
                isSelected
                  ? [
                      'border-[hsl(var(--mkt-fiesta))]',
                      'bg-[hsl(var(--mkt-fiesta)/0.15)]',
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
                {t(`consultation.goals.${key}`)}
              </span>
              {isSelected && (
                <span className="ml-auto text-[hsl(var(--mkt-fiesta))] text-sm" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {errors.goals && (
        <p id="goals-error" role="alert" className="text-sm text-[hsl(var(--mkt-fiesta))]">
          {t('consultation.validation.goals_required')}
        </p>
      )}
    </div>
  );
}
