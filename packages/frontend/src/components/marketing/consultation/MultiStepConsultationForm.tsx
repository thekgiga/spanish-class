import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import { FormProgress } from './FormProgress';
import { StepGoals } from './StepGoals';
import { StepService } from './StepService';
import { StepContact } from './StepContact';
import { SuccessPanel } from './SuccessPanel';

/* ─────────────────────────────────────────────
   Types & schema
───────────────────────────────────────────── */

export type GoalKey = 'travel_culture' | 'study_spain' | 'exam_prep' | 'career' | 'personal_growth';
export type ServiceKey = 'conversation' | 'grammar' | 'business' | 'cultural' | 'exam';

export interface ConsultationFormData {
  goals: GoalKey[];
  service: ServiceKey;
  intensity: 'basic' | 'intensive';
  name: string;
  email: string;
  message: string;
  consent: boolean;
}

const schema = z.object({
  goals: z.array(z.string()).min(1),
  service: z.string().min(1),
  intensity: z.enum(['basic', 'intensive']).default('basic'),
  name: z.string().min(1),
  email: z.string().min(1).email(),
  message: z.string().max(500).optional().default(''),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'required' }),
  }),
});

/* ─────────────────────────────────────────────
   Step → field mapping for per-step validation
───────────────────────────────────────────── */
const STEP_FIELDS: Array<Array<keyof ConsultationFormData>> = [
  ['goals'],
  ['service'],
  ['name', 'email', 'consent'],
];

/* ─────────────────────────────────────────────
   Fake submission adapter
───────────────────────────────────────────── */
async function submitConsultation(_data: ConsultationFormData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // real POST /api/contact plugs in here later with zero UI change
}

/* ─────────────────────────────────────────────
   Slide variants — direction-aware
───────────────────────────────────────────── */
function makeVariants(direction: 1 | -1, reduced: boolean) {
  if (reduced) {
    return {
      initial: {},
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  const offset = direction === 1 ? 60 : -60;
  return {
    initial: { opacity: 0, x: offset },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: -offset, transition: { duration: 0.2, ease: 'easeIn' } },
  };
}

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface Props {
  /** Pre-select a service on step 2 (from ?interest= param) */
  preselectedService?: ServiceKey;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function MultiStepConsultationForm({ preselectedService }: Props) {
  const { t } = useTranslation('about');
  const prefersReduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // IDs for focus management
  const headingIds = ['step-goals-h2', 'step-service-h2', 'step-contact-h2'];

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      goals: [],
      service: preselectedService ?? ('' as ServiceKey),
      intensity: 'basic',
      name: '',
      email: '',
      message: '',
    },
  });

  // Apply preselected service if provided
  useEffect(() => {
    if (preselectedService) {
      form.setValue('service', preselectedService);
      // Jump to step 2 if interest param provided
      setStep(1);
    }
  }, [preselectedService, form]);

  // Move focus to the new step heading
  function focusHeading(targetStep: number) {
    setTimeout(() => {
      const el = document.getElementById(headingIds[targetStep]);
      if (el) {
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: false });
      }
    }, 50);
  }

  async function handleNext() {
    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    const next = step + 1;
    setDirection(1);
    setStep(next);
    focusHeading(next);
  }

  function handleBack() {
    const prev = step - 1;
    setDirection(-1);
    setStep(prev);
    focusHeading(prev);
  }

  async function handleSubmit(data: ConsultationFormData) {
    setIsSubmitting(true);
    try {
      await submitConsultation(data);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const variants = makeVariants(direction, !!prefersReduced);

  if (isSuccess) {
    return <SuccessPanel />;
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
      className="space-y-8"
      aria-label="Consultation request"
    >
      {/* Progress */}
      <FormProgress currentStep={step} totalSteps={3} />

      {/* Step content with direction-aware slide */}
      <div className="min-h-[320px]">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepGoals form={form} headingId={headingIds[0]} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepService form={form} headingId={headingIds[1]} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepContact form={form} headingId={headingIds[2]} isSubmitting={isSubmitting} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex-1 rounded-xl py-3 px-5 text-sm font-semibold border border-[hsl(var(--mkt-glass-border)/0.3)] text-[hsl(var(--mkt-azahar)/0.8)] transition-colors hover:bg-[hsl(var(--mkt-glass-bg)/0.08)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))]"
          >
            {t('consultation.buttons.back')}
          </button>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-xl py-3 px-5 text-sm font-semibold text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--mkt-sol)), hsl(var(--mkt-fiesta)))',
            }}
          >
            {t('consultation.buttons.next')}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-semibold text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))] disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--mkt-sol)), hsl(var(--mkt-fiesta)))',
            }}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                {/* Spinner */}
                <span
                  className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                  aria-hidden="true"
                />
                {t('consultation.buttons.submitting')}
              </>
            ) : (
              t('consultation.buttons.submit')
            )}
          </button>
        )}
      </div>
    </form>
  );
}
