import { Link } from "react-router-dom";
import { ArrowRight, User, BookOpen, Eye, HeartHandshake } from "lucide-react";
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

const APPROACH_PILLARS = [
  { key: "p01" as const, Icon: User },
  { key: "p02" as const, Icon: BookOpen },
  { key: "p03" as const, Icon: Eye },
  { key: "p04" as const, Icon: HeartHandshake },
];

export function AboutPage() {
  const { t } = useTranslation("home");
  return (
    <div>
      <PageHeader label={t("about.label")} title={t("about.title")} />

      {/* About + Mission */}
      <section className="relative z-10 bg-canvas py-20 sm:py-28">
        <SpineRail />
        <SpineNode className="top-20 sm:top-28" />
        <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
          <FadeUp className="max-w-3xl">
            <p className="text-base leading-relaxed text-ink-secondary">
              {t("about.body1")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              {t("about.body2")}
            </p>
            <div className="mt-8 border-l-4 border-brand pl-6">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                {t("about.mission_label")}
              </p>
              <p className="font-display text-lg font-medium italic text-ink">
                {t("about.mission_text")}
              </p>
            </div>
          </FadeUp>

          {/* Founder */}
          <div className="mt-20 flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
            <FadeUp className="lg:w-80 lg:flex-shrink-0">
              <div className="mx-auto max-w-xs overflow-hidden rounded-ui-lg bg-canvas shadow-ui-2 lg:mx-0">
                <div
                  className="flex h-72 w-full items-center justify-center bg-accent-soft"
                  aria-label={t("founder.image_alt")}
                  role="img"
                >
                  <User className="h-24 w-24 text-accent" aria-hidden />
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-semibold text-ink">{t("founder.name")}</p>
                  <p className="mt-1 text-sm text-ink-secondary">{t("founder.role")}</p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1} className="lg:flex-1 lg:min-w-0">
              <SectionLabel>{t("founder.label")}</SectionLabel>
              <GoldRule className="mb-6" />
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio1")}</p>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio2")}</p>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio3")}</p>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio4")}</p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Approach pillars */}
      <section className="relative z-10 bg-surface py-20 sm:py-28">
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH_PILLARS.map(({ key, Icon }, i) => (
              <FadeUp key={key} delay={i * 0.07}>
                <div className="rounded-ui-md border border-line bg-canvas p-6 transition-shadow duration-standard hover:shadow-ui-1">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-ui-sm bg-accent-soft">
                    <Icon className="h-5 w-5 text-accent" aria-hidden />
                  </div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {t(`approach.${key}_title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {t(`approach.${key}_body`)}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.2} className="mt-12 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact">
                {t("cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="border border-line text-brand hover:border-brand hover:bg-accent-soft" asChild>
              <Link to="/how-it-works">
                {t("how_we_work.title")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
