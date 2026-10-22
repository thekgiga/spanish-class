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
import { MeshGradientBackground } from "@/components/marketing/MeshGradientBackground";
import { AuroraSection } from "@/components/marketing/AuroraSection";
import { GlassCard } from "@/components/marketing/GlassCard";
import { BentoCell } from "@/components/marketing/BentoCell";
import {
  SolRule,
  VibrantSectionLabel,
  MarketingPageHeader,
  VibrantFadeUp,
} from "@/components/marketing/vibrant-helpers";

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
      {/* ── Hero — noche mesh canvas ── */}
      <MeshGradientBackground
        variant="noche"
        as="section"
        className="relative overflow-hidden pb-20 pt-24 sm:pb-28 sm:pt-32"
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <MarketingPageHeader
            eyebrow={t("about.label")}
            title={t("about.title")}
            align="center"
            tone="dark"
          />
        </div>
      </MeshGradientBackground>

      <SolRule />

      {/* ── About intro + Founder portrait — AuroraSection ── */}
      <AuroraSection
        blobs={[
          {
            color: "violeta",
            size: "w-[520px] h-[400px]",
            position: "-top-32 -left-24",
            opacity: 0.45,
          },
          {
            color: "sol",
            size: "w-[400px] h-[300px]",
            position: "-bottom-20 -right-20",
            opacity: 0.4,
          },
        ]}
        scrim="dark"
        className="bg-mkt-noche py-14 sm:py-20"
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* Intro text + mission accordion */}
          <VibrantFadeUp className="max-w-3xl">
            <GlassCard tone="dark" className="p-8">
              <p className="text-base leading-relaxed text-mkt-azahar/85">
                {t("about.body1")}
              </p>
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="mission" className="border-0">
                  <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-widest text-mkt-sol hover:text-mkt-sol/80">
                    {t("about.mission_label")}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1">
                    <p className="text-base leading-relaxed text-mkt-azahar/80">
                      {t("about.body2")}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-mkt-azahar/80">
                      {t("about.mission_text")}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </GlassCard>
          </VibrantFadeUp>

          {/* Founder — 60/40 asymmetric editorial grid */}
          <div className="mt-16 grid items-center gap-8 md:grid-cols-5">
            {/* Left: bio text — 3 cols */}
            <VibrantFadeUp className="md:col-span-3">
              <VibrantSectionLabel tone="sol">
                {t("founder.label")}
              </VibrantSectionLabel>
              <SolRule className="mb-6 mt-3" />
              <GlassCard tone="dark" className="p-6">
                <p className="text-base leading-relaxed text-mkt-azahar/85">
                  {t("founder.bio1")}
                </p>
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="bio" className="border-0">
                    <AccordionTrigger className="py-2 text-sm font-medium text-mkt-azahar/70 hover:text-mkt-sol">
                      {t("founder.read_more")}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="mt-2 text-base leading-relaxed text-mkt-azahar/80">
                        {t("founder.bio2")}
                      </p>
                      <p className="mt-4 text-base leading-relaxed text-mkt-azahar/80">
                        {t("founder.bio3")}
                      </p>
                      <p className="mt-4 text-base leading-relaxed text-mkt-azahar/80">
                        {t("founder.bio4")}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </GlassCard>
            </VibrantFadeUp>

            {/* Right: portrait — 2 cols, visual tension offset */}
            <VibrantFadeUp
              delay={0.15}
              className="mt-8 md:col-span-2 md:-mt-12"
            >
              <MeshGradientBackground
                variant="mediterraneo"
                className="overflow-hidden rounded-2xl p-1"
              >
                <div className="overflow-hidden rounded-xl">
                  <div
                    className="flex h-80 w-full items-center justify-center bg-mkt-noche/50"
                    aria-label={t("founder.image_alt")}
                    role="img"
                  >
                    <User
                      className="h-24 w-24 text-mkt-azahar/40"
                      aria-hidden
                    />
                  </div>
                  <div className="border-t border-mkt-azahar/10 bg-mkt-noche/60 px-5 py-4">
                    <p className="font-mktdisplay text-lg font-semibold text-mkt-azahar">
                      {t("founder.name")}
                    </p>
                    <p className="mt-1 text-sm text-mkt-azahar/70">
                      {t("founder.role")}
                    </p>
                  </div>
                </div>
              </MeshGradientBackground>
            </VibrantFadeUp>
          </div>
        </div>
      </AuroraSection>

      <SolRule />

      {/* ── Why Elite Education — BentoCell differentiators ── */}
      <MeshGradientBackground
        variant="noche"
        as="section"
        className="py-14 sm:py-20"
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <VibrantFadeUp className="mb-10 max-w-2xl">
            <VibrantSectionLabel tone="sol">
              {t("standout.label")}
            </VibrantSectionLabel>
            <SolRule className="mb-6 mt-3" />
            <h2 className="font-mktdisplay text-2xl font-semibold text-mkt-azahar sm:text-3xl">
              {t("standout.title")}
            </h2>
          </VibrantFadeUp>

          <div className="grid items-stretch gap-4 sm:grid-cols-2">
            {STANDOUT_ITEMS.map(({ key, Icon }, i) => (
              <VibrantFadeUp key={key} delay={i * 0.07} className="h-full">
                <BentoCell tone="glass-dark" className="h-full">
                  <div className="flex gap-5">
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mkt-fiesta/20">
                        <Icon
                          className="h-5 w-5 text-mkt-sol"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-mktdisplay text-base font-semibold text-mkt-azahar">
                        {t(`standout.${key}_title`)}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-mkt-azahar/75">
                        {t(`standout.${key}_body`)}
                      </p>
                    </div>
                  </div>
                </BentoCell>
              </VibrantFadeUp>
            ))}
          </div>
        </div>
      </MeshGradientBackground>

      <SolRule />

      {/* ── Partner promise — closing CTA ── */}
      <AuroraSection
        blobs={[
          {
            color: "fiesta",
            size: "w-[400px] h-[300px]",
            position: "-top-16 -right-20",
            opacity: 0.5,
          },
          {
            color: "mediterraneo",
            size: "w-[360px] h-[280px]",
            position: "-bottom-16 -left-20",
            opacity: 0.45,
          },
        ]}
        scrim="dark"
        className="bg-mkt-noche py-20 sm:py-28"
      >
        <VibrantFadeUp className="mx-auto max-w-2xl px-8">
          <GlassCard tone="dark" className="p-10 text-center">
            <p
              className="font-mktdisplay text-5xl leading-none text-mkt-sol"
              aria-hidden="true"
            >
              {'"'}
            </p>
            <SolRule className="mx-auto my-6 max-w-xs" />
            <blockquote className="font-mktdisplay text-xl font-semibold leading-snug text-mkt-azahar sm:text-2xl">
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
          </GlassCard>
        </VibrantFadeUp>
      </AuroraSection>
    </div>
  );
}
