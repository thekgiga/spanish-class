import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  GoldRule,
  SectionLabel,
  SpineRail,
  SpineNode,
  PageHeader,
} from "@/components/shared/editorial-helpers";

const STEPS = ["s01", "s02", "s03", "s04"] as const;
const WHY_BULLETS = [
  "bullet_1", "bullet_2", "bullet_3",
  "bullet_4", "bullet_5", "bullet_6", "bullet_7",
] as const;

export function HowItWorksPage() {
  const { t } = useTranslation("home");
  return (
    <div>
      <PageHeader
        label={t("how_we_work.label")}
        title={t("how_we_work.title")}
      />

      {/* Steps timeline */}
      <section className="relative z-10 bg-canvas py-20 sm:py-28">
        <SpineRail />
        <SpineNode className="top-20 sm:top-28" />
        <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
          <FadeUp className="mb-14 max-w-2xl">
            <SectionLabel>{t("approach.label")}</SectionLabel>
            <GoldRule className="mb-6" />
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {t("approach.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              {t("approach.subtitle")}
            </p>
          </FadeUp>

          <ol className="space-y-10 mb-20" aria-label={t("how_we_work.title")}>
            {STEPS.map((s, i) => (
              <FadeUp key={s} delay={i * 0.08}>
                <li className="flex gap-6 sm:gap-10">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent bg-canvas shadow-ui-1">
                      <span className="font-display text-sm font-bold text-accent" aria-hidden="true">
                        {t(`how_we_work.${s}_number`)}
                      </span>
                    </div>
                    {i < 3 && (
                      <div className="mt-2 w-px flex-1 bg-accent/30 min-h-10" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {t(`how_we_work.${s}_title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary max-w-2xl">
                      {t(`how_we_work.${s}_body`)}
                    </p>
                  </div>
                </li>
              </FadeUp>
            ))}
          </ol>

          {/* Why Us conviction block */}
          <div className="rounded-ui-lg bg-brand px-8 py-12 sm:px-12">
            <FadeUp className="mb-10 max-w-2xl">
              <SectionLabel>{t("why_us.label")}</SectionLabel>
              <GoldRule className="mb-6" />
              <h2 className="font-display text-2xl font-semibold text-brand-contrast sm:text-3xl">
                {t("why_us.title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-contrast/80">
                {t("why_us.subtitle")}
              </p>
            </FadeUp>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_BULLETS.map((b, i) => (
                <FadeUp key={b} delay={i * 0.05}>
                  <div className="flex items-center gap-3 rounded-ui-md border border-brand-contrast/20 bg-brand-contrast/10 px-5 py-4">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" aria-hidden />
                    <span className="text-sm font-medium text-brand-contrast">
                      {t(`why_us.${b}`)}
                    </span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          <FadeUp delay={0.2} className="mt-12 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact">
                {t("cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
