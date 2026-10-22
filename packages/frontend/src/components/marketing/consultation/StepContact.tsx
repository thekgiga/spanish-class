import { useTranslation } from 'react-i18next';
import { type UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { ConsultationFormData } from './MultiStepConsultationForm';

interface StepContactProps {
  form: UseFormReturn<ConsultationFormData>;
  headingId: string;
  isSubmitting: boolean;
}

/**
 * Step 3 — Name, email, optional message, consent checkbox.
 */
export function StepContact({ form, headingId, isSubmitting }: StepContactProps) {
  const { t } = useTranslation('about');
  const { register, watch, formState: { errors } } = form;

  const message = watch('message') ?? '';
  const MAX_MSG = 500;

  const inputBase = cn(
    'w-full rounded-xl px-4 py-3 text-sm bg-[hsl(var(--mkt-glass-bg)/0.08)] border',
    'text-[hsl(var(--mkt-azahar))] placeholder:text-[hsl(var(--mkt-azahar)/0.4)]',
    'outline-none transition-colors duration-200',
    'focus:border-[hsl(var(--mkt-sol))] focus:bg-[hsl(var(--mkt-glass-bg)/0.14)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2
          id={headingId}
          className="text-2xl font-bold text-[hsl(var(--mkt-azahar))]"
        >
          {t('consultation.step3.title')}
        </h2>
        <p className="text-sm text-[hsl(var(--mkt-azahar)/0.7)]">
          {t('consultation.step3.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label
            htmlFor="consult-name"
            className="block text-sm font-medium text-[hsl(var(--mkt-azahar)/0.85)]"
          >
            {t('consultation.fields.name')}
          </label>
          <input
            id="consult-name"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={cn(
              inputBase,
              errors.name
                ? 'border-[hsl(var(--mkt-fiesta)/0.7)]'
                : 'border-[hsl(var(--mkt-glass-border)/0.3)]',
            )}
            {...register('name')}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-xs text-[hsl(var(--mkt-fiesta))]">
              {t('consultation.validation.name_required')}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label
            htmlFor="consult-email"
            className="block text-sm font-medium text-[hsl(var(--mkt-azahar)/0.85)]"
          >
            {t('consultation.fields.email')}
          </label>
          <input
            id="consult-email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={cn(
              inputBase,
              errors.email
                ? 'border-[hsl(var(--mkt-fiesta)/0.7)]'
                : 'border-[hsl(var(--mkt-glass-border)/0.3)]',
            )}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-[hsl(var(--mkt-fiesta))]">
              {errors.email.type === 'too_small'
                ? t('consultation.validation.email_required')
                : t('consultation.validation.email_invalid')}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label
            htmlFor="consult-message"
            className="flex items-center justify-between text-sm font-medium text-[hsl(var(--mkt-azahar)/0.85)]"
          >
            <span>{t('consultation.fields.message')}</span>
            <span
              className={cn(
                'text-xs tabular-nums',
                message.length > MAX_MSG * 0.9
                  ? 'text-[hsl(var(--mkt-fiesta))]'
                  : 'text-[hsl(var(--mkt-azahar)/0.4)]',
              )}
              aria-live="polite"
            >
              {message.length}/{MAX_MSG}
            </span>
          </label>
          <textarea
            id="consult-message"
            rows={4}
            disabled={isSubmitting}
            maxLength={MAX_MSG}
            className={cn(inputBase, 'resize-none border-[hsl(var(--mkt-glass-border)/0.3)]')}
            {...register('message')}
          />
        </div>

        {/* Consent */}
        <div className="flex items-start gap-3">
          <input
            id="consult-consent"
            type="checkbox"
            disabled={isSubmitting}
            aria-invalid={errors.consent ? 'true' : 'false'}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className={cn(
              'mt-0.5 h-4 w-4 rounded border accent-[hsl(var(--mkt-fiesta))]',
              'focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))]',
            )}
            {...register('consent')}
          />
          <div className="space-y-1">
            <label
              htmlFor="consult-consent"
              className="text-sm text-[hsl(var(--mkt-azahar)/0.8)] cursor-pointer"
            >
              {t('consultation.fields.consent')}
            </label>
            {errors.consent && (
              <p id="consent-error" role="alert" className="text-xs text-[hsl(var(--mkt-fiesta))]">
                {t('consultation.validation.consent_required')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
