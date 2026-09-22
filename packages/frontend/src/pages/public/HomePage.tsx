import { useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Globe,
  Tent,
  Compass,
  Lightbulb,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Eye,
  HeartHandshake,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// ── Shared animation ─────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Gold rule divider ────────────────────────────────────────────────────────

function GoldRule({ className }: { className?: string }) {
  return (
    <div
      className={`h-px w-16 bg-accent ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

// ── Section label chip ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
      {children}
    </p>
  );
}

// ── FAQ accordion item ───────────────────────────────────────────────────────

function FAQItem({
  question,
  answer,
  link,
  linkLabel,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  link: string;
  linkLabel: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      >
        <span className="text-sm font-semibold text-ink sm:text-base">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" aria-hidden />
        ) : (
          <ChevronDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-secondary" aria-hidden />
        )}
      </button>
      {isOpen && (
        <div className="pb-5">
          <p className="text-sm leading-relaxed text-ink-secondary">{answer}</p>
          <Link
            to={link}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-hover"
          >
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Spine decorative helpers ─────────────────────────────────────────────────
// Both are pointer-events-none / aria-hidden; they never participate in the tab
// order or accessibility tree.
//
// SpineRail: per-section animated 2 px gold line, absolutely positioned INSIDE
//   its section so it always paints above the opaque section background.
//   Animates scaleY 0→1 as the section enters the viewport (static at full
//   length under prefers-reduced-motion).
//
// SpineNode: 12×12 gold dot, centered on the same x-axis as SpineRail via
//   -translate-x-1/2 so it sits visually ON the rail at the section content
//   start.

function SpineRail() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-4 sm:left-6 lg:left-8 -translate-x-1/2 z-10"
    >
      <motion.div
        className="w-0.5 h-full bg-accent origin-top"
        initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
        }
        viewport={{ once: true, margin: "-5%" }}
      />
    </div>
  );
}

function SpineNode({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-4 sm:left-6 lg:left-8 -translate-x-1/2 z-20 h-3 w-3 rounded-full bg-accent ring-2 ring-accent/30 ring-offset-1 ${className ?? ""}`}
    />
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────

// Hero media — flip these three consts to swap between available videos.
// Precedence: video (non-reduced-motion) → heroImageSrc → burgundy fallback.
// Available: "hero-media" (Sagrada Família sunset), "hero-media-street" (Barcelona street, corporate)
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
      {/* Ground layer — media.
          Precedence: video → supplied image → burgundy fallback. */}
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
        {/* Cinematic left-side gradient — protects the text lane without washing the video.
            Right half of the frame shows the footage with minimal interference. */}
        <div className="absolute inset-0 bg-gradient-to-r from-hero-bg/80 via-hero-bg/30 to-transparent" />
        {/* Subtle bottom vignette — grounds the scroll cue */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-hero-bg/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          // lg:border-l-2 is the visual origin point of the page-wide gold spine
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
              <a href="#services">{t("hero.cta_services")}</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue — desktop only, aligned with the content column */}
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

      {/* Hero-end sentinel — watched by public Header to switch from overlay to solid */}
      <div id="landing-hero-end" className="absolute bottom-0 left-0 right-0 h-px" aria-hidden="true" />
    </section>
  );
}

// ── StorySection — About + Founder merged ────────────────────────────────────

function StorySection() {
  const { t } = useTranslation("home");
  return (
    <section className="relative z-10 bg-canvas py-20 sm:py-28">
      <SpineRail />
      <SpineNode className="top-20 sm:top-28" />
      <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">

        {/* About block */}
        <FadeUp className="max-w-3xl">
          <div className="mb-6">
            <SectionLabel>{t("about.label")}</SectionLabel>
          </div>
          <GoldRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
            {t("about.title")}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink-secondary">
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

        {/* Founder block */}
        <div className="mt-20 flex flex-col items-start gap-12 lg:flex-row lg:gap-16">

          {/* Portrait column */}
          <FadeUp className="lg:w-80 lg:flex-shrink-0">
            <div className="mx-auto max-w-xs overflow-hidden rounded-ui-lg bg-canvas shadow-ui-2 lg:mx-0">
              {/* Placeholder portrait — replaced when founder photo is provided */}
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

          {/* Bio column */}
          <FadeUp delay={0.1} className="lg:flex-1 lg:min-w-0">
            <div className="mb-6">
              <SectionLabel>{t("founder.label")}</SectionLabel>
            </div>
            <GoldRule className="mb-6" />
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio1")}</p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio2")}</p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio3")}</p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t("founder.bio4")}</p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── Services ─────────────────────────────────────────────────────────────────

const SERVICE_CARDS = [
  { key: "s01" as const, img: "/imgs/brand/service-card-01.webp", eager: true },
  { key: "s02" as const, img: "/imgs/brand/service-card-02.webp", eager: true },
  { key: "s03" as const, img: "/imgs/brand/service-card-03.webp", eager: false },
  { key: "s04" as const, img: "/imgs/brand/service-card-04.webp", eager: false },
];

function ServicesSection() {
  const { t } = useTranslation("home");
  return (
    <section id="services" className="relative z-10 bg-surface py-20 sm:py-28">
      <SpineRail />
      <SpineNode className="top-20 sm:top-28" />
      <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
        <FadeUp className="mb-14 max-w-2xl">
          <div className="mb-6">
            <SectionLabel>{t("services.label")}</SectionLabel>
          </div>
          <GoldRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t("services.subtitle")}
          </p>
        </FadeUp>

        <div className="grid gap-8 md:grid-cols-2">
          {SERVICE_CARDS.map(({ key, img, eager }, i) => {
            const bullets = t(`services.${key}_bullets`, { returnObjects: true }) as string[];
            return (
              <FadeUp key={key} delay={i * 0.08}>
                <article className="flex flex-col overflow-hidden rounded-ui-lg border border-line bg-canvas shadow-ui-1 transition-shadow duration-standard hover:shadow-ui-2">
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
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                      {t(`services.${key}_label`)}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {t(`services.${key}_title`)}
                    </h3>
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
      </div>
    </section>
  );
}

// ── ThePathSection — Approach + How We Work + Why Us merged ──────────────────
// The page's signature section: a continuous journey from "our approach" through
// the 4-step process to the conviction bullets — all threaded on the gold spine.

const APPROACH_PILLARS = [
  { key: "p01" as const, Icon: User },
  { key: "p02" as const, Icon: BookOpen },
  { key: "p03" as const, Icon: Eye },
  { key: "p04" as const, Icon: HeartHandshake },
];

const STEPS = ["s01", "s02", "s03", "s04"] as const;

const WHY_BULLETS = [
  "bullet_1", "bullet_2", "bullet_3",
  "bullet_4", "bullet_5", "bullet_6", "bullet_7",
] as const;

function ThePathSection() {
  const { t } = useTranslation("home");
  return (
    <section className="relative z-10 bg-canvas py-20 sm:py-28">
      <SpineRail />
      <SpineNode className="top-20 sm:top-28" />
      <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">

        {/* Section header — reuses how_we_work umbrella keys, zero new i18n */}
        <FadeUp className="mb-14 max-w-2xl">
          <div className="mb-6">
            <SectionLabel>{t("how_we_work.label")}</SectionLabel>
          </div>
          <GoldRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("how_we_work.title")}
          </h2>
        </FadeUp>

        {/* Block A — Approach pillars: 4-up grid */}
        <div className="mb-20">
          <FadeUp className="mb-8">
            <h3 className="font-display text-xl font-semibold text-ink">
              {t("approach.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary max-w-xl">
              {t("approach.subtitle")}
            </p>
          </FadeUp>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH_PILLARS.map(({ key, Icon }, i) => (
              <FadeUp key={key} delay={i * 0.07}>
                <div className="rounded-ui-md border border-line bg-surface p-6 transition-shadow duration-standard hover:shadow-ui-1">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-ui-sm bg-accent-soft">
                    <Icon className="h-5 w-5 text-accent" aria-hidden />
                  </div>
                  <h4 className="font-display text-base font-semibold text-ink">
                    {t(`approach.${key}_title`)}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {t(`approach.${key}_body`)}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* Block B — Steps: vertical timeline nodes */}
        <div className="mb-20">
          <ol className="space-y-10" aria-label={t("how_we_work.title")}>
            {STEPS.map((s, i) => (
              <FadeUp key={s} delay={i * 0.08}>
                <li className="flex gap-6 sm:gap-10">
                  {/* Step number badge anchored visually to the spine node column */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent bg-canvas shadow-ui-1">
                      <span className="font-display text-sm font-bold text-accent" aria-hidden="true">
                        {t(`how_we_work.${s}_number`)}
                      </span>
                    </div>
                    {/* Connector to next step */}
                    {i < 3 && (
                      <div className="mt-2 w-px flex-1 bg-accent/30 min-h-10" aria-hidden="true" />
                    )}
                  </div>
                  {/* Step content */}
                  <div className="flex-1 pb-2">
                    <h4 className="font-display text-lg font-semibold text-ink">
                      {t(`how_we_work.${s}_title`)}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary max-w-2xl">
                      {t(`how_we_work.${s}_body`)}
                    </p>
                  </div>
                </li>
              </FadeUp>
            ))}
          </ol>
        </div>

        {/* Block C — Why Us: conviction band on brand */}
        <div className="rounded-ui-lg bg-brand px-8 py-12 sm:px-12">
          <FadeUp className="mb-10 max-w-2xl">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {t("why_us.label")}
              </p>
            </div>
            <GoldRule className="mb-6" />
            <h3 className="font-display text-2xl font-semibold text-brand-contrast sm:text-3xl">
              {t("why_us.title")}
            </h3>
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

      </div>
    </section>
  );
}

// ── Guide teaser ──────────────────────────────────────────────────────────────

type RubricKey = "study" | "learn" | "live" | "experience" | "camps" | "insights";

const GUIDE_RUBRICS: Array<{
  rubric: RubricKey;
  Icon: React.ElementType;
  questionKeys: string[];
}> = [
  {
    rubric: "study",
    Icon: GraduationCap,
    questionKeys: ["guide_teaser.rubric_study_q1", "guide_teaser.rubric_study_q2", "guide_teaser.rubric_study_q3"],
  },
  {
    rubric: "learn",
    Icon: BookOpen,
    questionKeys: ["guide_teaser.rubric_learn_q1", "guide_teaser.rubric_learn_q2", "guide_teaser.rubric_learn_q3"],
  },
  {
    rubric: "live",
    Icon: Globe,
    questionKeys: ["guide_teaser.rubric_live_q1", "guide_teaser.rubric_live_q2", "guide_teaser.rubric_live_q3"],
  },
  {
    rubric: "camps",
    Icon: Tent,
    questionKeys: ["guide_teaser.rubric_camps_q1", "guide_teaser.rubric_camps_q2", "guide_teaser.rubric_camps_q3"],
  },
  { rubric: "experience", Icon: Compass,   questionKeys: [] },
  { rubric: "insights",   Icon: Lightbulb, questionKeys: [] },
];

function GuideTeaserSection() {
  const { t } = useTranslation("home");
  return (
    <section className="relative z-10 bg-surface py-20 sm:py-28">
      <SpineRail />
      <SpineNode className="top-20 sm:top-28" />
      <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
        <FadeUp className="mb-14 max-w-2xl">
          <div className="mb-6">
            <SectionLabel>{t("guide_teaser.label")}</SectionLabel>
          </div>
          <GoldRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("guide_teaser.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t("guide_teaser.subtitle")}
          </p>
        </FadeUp>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE_RUBRICS.map(({ rubric, Icon, questionKeys }, i) => (
            <FadeUp key={rubric} delay={i * 0.07}>
              <Link
                to={`/elite-guide?rubric=${rubric}`}
                className="group flex flex-col rounded-ui-lg border border-line bg-canvas p-6 transition-all duration-standard hover:border-brand hover:shadow-ui-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-ui-sm bg-accent-soft transition-colors duration-standard group-hover:bg-brand">
                  <Icon className="h-5 w-5 text-accent transition-colors duration-standard group-hover:text-brand-contrast" aria-hidden />
                </div>
                <h3 className="font-display text-base font-semibold text-ink">
                  {t(`guide_teaser.rubric_${rubric}`)}
                </h3>
                {questionKeys.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {questionKeys.map((qKey) => (
                      <li key={qKey} className="flex items-start gap-1.5 text-xs text-ink-tertiary">
                        <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0 text-accent/60" aria-hidden />
                        {t(qKey)}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto pt-4">
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition-opacity duration-standard group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    {t("guide_teaser.cta_explore")} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2} className="mt-10 text-center">
          <Button variant="primary" size="lg" asChild>
            <Link to="/elite-guide">
              {t("guide_teaser.cta_explore")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </FadeUp>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = ["q1", "q2", "q3", "q4", "q5"] as const;

function FAQSection() {
  const { t } = useTranslation("home");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 bg-canvas py-20 sm:py-28">
      <SpineRail />
      <SpineNode className="top-20 sm:top-28" />
      <div className="mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16">
        <div className="grid gap-16 lg:grid-cols-3">
          <FadeUp className="lg:col-span-1">
            <div className="mb-6">
              <SectionLabel>{t("faq.label")}</SectionLabel>
            </div>
            <GoldRule className="mb-6" />
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {t("faq.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              {t("faq.subtitle")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-6 border border-line text-brand hover:border-brand hover:bg-accent-soft"
              asChild
            >
              <Link to="/elite-guide">
                {t("faq.cta_more")}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          </FadeUp>

          <FadeUp delay={0.1} className="lg:col-span-2">
            <div
              className="rounded-ui-lg border border-line bg-surface px-6"
              role="list"
              aria-label={t("faq.title")}
            >
              {FAQ_ITEMS.map((item, i) => (
                <div key={item} role="listitem">
                  <FAQItem
                    question={t(`faq.${item}_question`)}
                    answer={t(`faq.${item}_answer`)}
                    link={t(`faq.${item}_link`)}
                    linkLabel={t("guide_teaser.cta_explore")}
                    isOpen={openIndex === i}
                    onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                  />
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
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
      <StorySection />
      <ServicesSection />
      <ThePathSection />
      <GuideTeaserSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}
