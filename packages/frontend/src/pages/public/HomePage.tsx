import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Tent,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  GoldRule,
  SectionLabel,
} from "@/components/shared/editorial-helpers";

// ── Hero media ──────────────────────────────────────────────────────────────
const heroImageSrc: string | undefined = "/imgs/brand/hero-media-street.webp";
const heroVideoSrc: string | undefined = "/imgs/brand/hero-media-street.mp4";
const heroPosterSrc: string = "/imgs/brand/hero-media-street-poster.webp";

function HeroSection() {
  const { t } = useTranslation("home");
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: prefersReducedMotion
        ? {}
        : { staggerChildren: 0.11, delayChildren: 0.08 },
    },
  };
  const item: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      };

  const showVideo = heroVideoSrc && !prefersReducedMotion;

  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden bg-hero-bg py-24 sm:py-32"
      aria-label={t("hero.title")}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {showVideo ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={heroPosterSrc}
            preload="metadata"
          >
            <source src={heroVideoSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={heroImageSrc ?? "/imgs/brand/hero-background-burgundy.webp"}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-hero-bg/80 via-hero-bg/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-hero-bg/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl lg:border-l-2 lg:border-accent lg:pl-10"
        >
          <motion.h1
            variants={item}
            className="font-display text-5xl font-semibold leading-tight text-hero-fg hero-text-shadow sm:text-6xl lg:text-7xl"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button
              variant="primary"
              size="lg"
              className="bg-hero-ctaBg text-hero-ctaFg hover:bg-hero-ctaHover focus-visible:ring-hero-progress"
              asChild
            >
              <Link to="/contact">
                {t("hero.cta_consult")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="border border-hero-fg/60 text-hero-fg hover:border-accent hover:text-accent transition-colors"
              asChild
            >
              <a href="#services-preview">{t("hero.cta_services")}</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 hidden md:block">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-hero-fg/60">
            <span className="text-xs font-semibold uppercase tracking-widest">
              {t("hero.scroll_hint")}
            </span>
            <motion.span
              aria-hidden="true"
              animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </div>
        </div>
      </div>

      <div id="landing-hero-end" className="absolute bottom-0 left-0 right-0 h-px" aria-hidden="true" />
    </section>
  );
}

// ── Value intro — about pitch + mission quote ─────────────────────────────────

function ValueIntroSection() {
  const { t } = useTranslation("home");
  return (
    <section id="intro" className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

          <FadeUp>
            <SectionLabel>{t("about.label")}</SectionLabel>
            <GoldRule className="mb-6" />
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {t("about.title")}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-secondary">
              {t("about.body1")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              {t("about.body2")}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
            >
              {t("intro.cta")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </FadeUp>

          <FadeUp delay={0.12}>
            <div className="flex h-full items-center">
              <blockquote className="w-full rounded-ui-lg border border-line bg-surface px-8 py-10">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
                  {t("about.mission_label")}
                </p>
                <GoldRule className="mb-6" />
                <p className="font-display text-xl font-medium italic leading-relaxed text-ink sm:text-2xl">
                  "{t("about.mission_text")}"
                </p>
              </blockquote>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── Services preview — 4 icon cards ──────────────────────────────────────────

const SERVICE_ICONS = [BookOpen, GraduationCap, Tent, MessageSquare] as const;
const SERVICE_KEYS = ["s01", "s02", "s03", "s04"] as const;

function ServicesPreviewSection() {
  const { t } = useTranslation("home");
  return (
    <section id="services-preview" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-14 max-w-2xl">
          <SectionLabel>{t("services.label")}</SectionLabel>
          <GoldRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t("services.subtitle")}
          </p>
        </FadeUp>

        <div className="grid gap-6 sm:grid-cols-2">
          {SERVICE_KEYS.map((key, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <FadeUp key={key} delay={i * 0.08}>
                <Link
                  to={`/services#${key}`}
                  className="group flex flex-col rounded-ui-lg border border-line bg-canvas p-6 transition-all duration-standard hover:border-brand hover:shadow-ui-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-ui-sm bg-accent-soft transition-colors duration-standard group-hover:bg-brand">
                      <Icon className="h-5 w-5 text-accent transition-colors duration-standard group-hover:text-brand-contrast" aria-hidden />
                    </div>
                    <span className="font-display text-3xl font-bold leading-none text-ink/10">
                      {t(`services.${key}_number`)}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-accent">
                    {t(`services.${key}_label`)}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                    {t(`services.${key}_title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {t(`services.${key}_teaser`)}
                  </p>
                  <div className="mt-auto pt-5">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition-opacity duration-standard group-hover:opacity-100"
                      aria-hidden="true"
                    >
                      {t(`services.${key}_cta`)} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.2} className="mt-10 flex justify-center">
          <Button variant="primary" size="lg" asChild>
            <Link to="/services">
              {t("services.cta_all")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTASection() {
  const { t } = useTranslation("home");
  return (
    <section className="relative z-10 bg-hero-bg py-20 sm:py-28">
      <FadeUp className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <img
          src="/imgs/brand/cta-banner.webp"
          alt=""
          aria-hidden="true"
          className="mx-auto mb-8 h-16 w-auto opacity-60"
          loading="lazy"
        />
        <h2 className="font-display text-3xl font-semibold text-hero-fg sm:text-4xl">
          {t("cta.title")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-hero-fg/80">
          {t("cta.body")}
        </p>
        <div className="mt-8">
          <Button
            variant="primary"
            size="lg"
            className="bg-hero-ctaBg text-hero-ctaFg hover:bg-hero-ctaHover focus-visible:ring-hero-progress"
            asChild
          >
            <Link to="/contact">
              {t("cta.button")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </FadeUp>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ValueIntroSection />
      <ServicesPreviewSection />
      <FinalCTASection />
    </div>
  );
}
