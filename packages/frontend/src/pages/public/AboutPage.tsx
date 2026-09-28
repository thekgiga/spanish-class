import { Link } from "react-router-dom";
import { ArrowRight, User, BookOpen, Eye, HeartHandshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  FadeUp,
  GoldRule,
  SectionLabel,
  SpineRail,
  SpineNode,
  PageHeader,
} from "@/components/shared/editorial-helpers";

const STANDOUT_ITEMS = [
  { key: "i01" as const, Icon: User },
  { key: "i02" as const, Icon: BookOpen },
  { key: "i03" as const, Icon: Eye },
  { key: "i04" as const, Icon: HeartHandshake },
] as const;

export function AboutPage() {
  const { t } = useTranslation("home");
  return (
    <div>
      <PageHeader label={t("about.label")} title={t("about.title")} spineIndent />

      {/* About intro + mission */}
      <section className="relative z-10 bg-canvas py-14 sm:py-20">
        <SpineRail />
        <SpineNode className="top-20 sm:top-28" />
        <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
          <FadeUp className="max-w-3xl">
            <p className="text-base leading-relaxed text-ink-secondary">
              {t("about.body1")}
            </p>

            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="mission" className="border-0">
                <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-widest text-accent hover:text-accent/80">
                  {t("about.mission_label")}
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <p className="text-base leading-relaxed text-ink-secondary">
                    {t("about.body2")}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                    {t("about.mission_text")}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FadeUp>

          {/* Founder */}
          <div className="mt-14 flex flex-col items-start gap-10 lg:flex-row lg:gap-14">
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

              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                {t("founder.bio1")}
              </p>

              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="bio" className="border-0">
                  <AccordionTrigger className="py-2 text-sm font-medium text-ink-secondary hover:text-accent">
                    {t("founder.read_more")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mt-2 text-base leading-relaxed text-ink-secondary">
                      {t("founder.bio2")}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                      {t("founder.bio3")}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                      {t("founder.bio4")}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Why Elite Education — consolidated differentiators */}
      <section className="relative z-10 bg-surface py-14 sm:py-20">
        <SpineRail />
        <SpineNode className="top-20 sm:top-28" />
        <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
          <div className="rounded-ui-lg bg-brand px-8 py-10 sm:px-12">
            <FadeUp className="mb-10 max-w-2xl">
              <SectionLabel>{t("standout.label")}</SectionLabel>
              <GoldRule className="mb-6" />
              <h2 className="font-display text-2xl font-semibold text-brand-contrast sm:text-3xl">
                {t("standout.title")}
              </h2>
            </FadeUp>

            <div className="grid gap-5 sm:grid-cols-2">
              {STANDOUT_ITEMS.map(({ key, Icon }, i) => (
                <FadeUp key={key} delay={i * 0.07}>
                  <div className="flex gap-5 rounded-ui-md border border-brand-contrast/20 bg-brand-contrast/10 px-6 py-5">
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-ui-sm bg-accent/20">
                        <Icon className="h-5 w-5 text-accent" aria-hidden />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-brand-contrast">
                        {t(`standout.${key}_title`)}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-brand-contrast/75">
                        {t(`standout.${key}_body`)}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner promise — closing CTA */}
      <section className="bg-brand py-20 sm:py-28">
        <FadeUp>
          <div className="mx-auto max-w-2xl px-8 text-center">
            <p className="font-display text-5xl leading-none text-accent" aria-hidden="true">
              {'“'}
            </p>
            <GoldRule className="mx-auto mb-8 mt-2" />
            <blockquote className="font-display text-xl font-semibold leading-snug text-brand-contrast sm:text-2xl">
              {t("approach.subtitle")}
            </blockquote>
            <div className="mt-10 flex justify-center">
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
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
