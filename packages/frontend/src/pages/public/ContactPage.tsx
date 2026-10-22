import { useSearchParams } from 'react-router-dom';
import { Mail, MapPin, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SEOMeta } from '@/components/shared/SEOMeta';
import { MeshGradientBackground } from '@/components/marketing/MeshGradientBackground';
import { AuroraSection } from '@/components/marketing/AuroraSection';
import { GlassCard } from '@/components/marketing/GlassCard';
import {
  MarketingPageHeader,
  VibrantSectionLabel,
  VibrantFadeUp,
  SolRule,
} from '@/components/marketing/vibrant-helpers';
import { MultiStepConsultationForm, type ServiceKey } from '@/components/marketing/consultation/MultiStepConsultationForm';

const VALID_SERVICES = new Set<ServiceKey>([
  'conversation',
  'grammar',
  'business',
  'cultural',
  'exam',
]);

function parseInterest(raw: string | null): ServiceKey | undefined {
  if (raw && VALID_SERVICES.has(raw as ServiceKey)) {
    return raw as ServiceKey;
  }
  return undefined;
}

export function ContactPage() {
  const { t } = useTranslation('about');
  const [searchParams] = useSearchParams();
  const interest = parseInterest(searchParams.get('interest'));

  return (
    <>
      <SEOMeta
        title={t('contact.seo_title')}
        description={t('contact.seo_description')}
        canonical="/contact"
        keywords={[
          'contact spanish class',
          'spanish learning support',
          'free consultation',
          'get in touch',
        ]}
        type="website"
      />

      {/* ── Page header on noche mesh ── */}
      <MeshGradientBackground variant="noche" as="header" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MarketingPageHeader
            eyebrow={t('contact.badge')}
            title={t('contact.title')}
            deck={t('contact.subtitle')}
            align="center"
            tone="dark"
          />
        </div>
      </MeshGradientBackground>

      {/* ── Multi-step form on aurora background ── */}
      <AuroraSection
        blobs={[
          { color: 'fiesta', size: 'w-[480px] h-[400px]', position: '-top-20 -left-24', opacity: 0.45 },
          { color: 'sol',    size: 'w-[400px] h-[360px]', position: '-bottom-10 -right-20', opacity: 0.4 },
        ]}
        scrim="dark"
        as="section"
        className="bg-[hsl(var(--mkt-noche))] py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 items-start">

            {/* ── Form card ── */}
            <div className="lg:col-span-2">
              <VibrantFadeUp>
                <GlassCard tone="dark" className="p-8">
                  <MultiStepConsultationForm preselectedService={interest} />
                </GlassCard>
              </VibrantFadeUp>
            </div>

            {/* ── Contact info ── */}
            <div className="space-y-8">
              <VibrantFadeUp delay={0.15}>
                <GlassCard tone="dark" className="p-6 space-y-5">
                  <VibrantSectionLabel tone="sol">{t('contact.info_title')}</VibrantSectionLabel>
                  <SolRule />

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--mkt-mediterraneo)), hsl(var(--mkt-sol)))' }}
                      aria-hidden="true"
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--mkt-sol))]">
                        {t('contact.info_email_label')}
                      </p>
                      <a
                        href="mailto:professor@spanishclass.com"
                        className="text-sm text-[hsl(var(--mkt-azahar)/0.85)] hover:text-[hsl(var(--mkt-sol))] transition-colors break-all"
                      >
                        professor@spanishclass.com
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--mkt-fiesta)), hsl(var(--mkt-sol)))' }}
                      aria-hidden="true"
                    >
                      <MapPin className="w-5 h-5 text-white" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--mkt-sol))]">
                        {t('contact.info_location_label')}
                      </p>
                      <p className="text-sm text-[hsl(var(--mkt-azahar)/0.85)]">
                        {t('contact.info_location_value')}
                      </p>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #e1306c, #833ab4)' }}
                      aria-hidden="true"
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--mkt-sol))]">
                        {t('contact.info_instagram_label')}
                      </p>
                      <a
                        href="https://www.instagram.com/elite.education.rs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[hsl(var(--mkt-azahar)/0.85)] hover:text-[hsl(var(--mkt-fiesta))] transition-colors"
                      >
                        @elite.education.rs
                      </a>
                    </div>
                  </div>
                </GlassCard>
              </VibrantFadeUp>
            </div>
          </div>
        </div>
      </AuroraSection>
    </>
  );
}
