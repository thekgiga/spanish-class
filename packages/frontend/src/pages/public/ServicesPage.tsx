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

const SERVICE_CARDS = [
  { key: "s01" as const, img: "/imgs/brand/service-card-01.webp", eager: true },
  { key: "s02" as const, img: "/imgs/brand/service-card-02.webp", eager: true },
  { key: "s03" as const, img: "/imgs/brand/service-card-03.webp", eager: false },
  { key: "s04" as const, img: "/imgs/brand/service-card-04.webp", eager: false },
];

export function ServicesPage() {
  const { t } = useTranslation("home");
  return (
    <div>
      <PageHeader
        label={t("services.label")}
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        spineIndent
      />

      <section className="relative z-10 bg-canvas py-20 sm:py-28">
        <SpineRail />
        <SpineNode className="top-20 sm:top-28" />
        <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
          <div className="grid gap-8 md:grid-cols-2">
            {SERVICE_CARDS.map(({ key, img, eager }, i) => {
              const bullets = t(`services.${key}_bullets`, { returnObjects: true }) as string[];
              return (
                <FadeUp key={key} delay={i * 0.08}>
                  <article
                    id={key}
                    className="flex flex-col overflow-hidden rounded-ui-lg border border-line bg-canvas shadow-ui-1 transition-shadow duration-standard hover:shadow-ui-2"
                  >
                    <div className="relative h-48 overflow-hidden sm:h-56">
                      <img
                        src={img}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover"
                        loading={eager ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-hero-bg/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="font-display text-4xl font-bold text-hero-fg/60">
                          {t(`services.${key}_number`)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <SectionLabel>{t(`services.${key}_label`)}</SectionLabel>
                      <h2 className="font-display text-xl font-semibold text-ink">
                        {t(`services.${key}_title`)}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                        {t(`services.${key}_body`)}
                      </p>
                      {Array.isArray(bullets) && bullets.length > 0 && (
                        <ul className="mt-4 space-y-1.5" aria-label={t(`services.${key}_label`)}>
                          {bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2 text-sm text-ink-secondary">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" aria-hidden />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-5 border-t border-line pt-4 text-sm font-medium italic text-ink-secondary">
                        {t(`services.${key}_tagline`)}
                      </p>
                      <div className="mt-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="border border-line text-brand hover:border-brand hover:bg-accent-soft"
                          asChild
                        >
                          <Link to="/contact">
                            {t(`services.${key}_cta`)}
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </FadeUp>
              );
            })}
          </div>

          <FadeUp delay={0.3} className="mt-14 rounded-ui-lg bg-brand px-8 py-10 sm:px-12 text-center">
            <GoldRule className="mx-auto mb-6" />
            <h2 className="font-display text-2xl font-semibold text-brand-contrast sm:text-3xl">
              {t("cta.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-contrast/80 max-w-xl mx-auto">
              {t("cta.body")}
            </p>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                className="bg-hero-ctaBg text-hero-ctaFg hover:bg-hero-ctaHover"
                asChild
              >
                <Link to="/contact">
                  {t("cta.button")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
