import { Link } from "react-router-dom";
import { motion, useReducedMotion, useMotionValue, useTransform, animate, useInView, type Variants } from "framer-motion";
import { useRef, useEffect, Fragment } from "react";
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  MessagesSquare,
  Compass,
  ClipboardCheck,
  HeartHandshake,
  Languages,
  GraduationCap,
  Tent,
  Lightbulb,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  SectionLabel,
  SpineRail,
  SpineNode,
} from "@/components/shared/editorial-helpers";
import { MeshGradientBackground } from '@/components/marketing/MeshGradientBackground';
import { AuroraSection } from '@/components/marketing/AuroraSection';
import { GlassCard } from '@/components/marketing/GlassCard';
import { BentoCell } from '@/components/marketing/BentoCell';
import { SolRule, VibrantSectionLabel } from '@/components/marketing/vibrant-helpers';
import { magneticCta } from '@/lib/motion';

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
    <MeshGradientBackground
      variant="noche"
      animate
      className="relative flex min-h-screen items-center overflow-hidden py-16 sm:py-24"
    >
      <section
        className="relative flex min-h-screen items-center overflow-hidden bg-transparent py-16 sm:py-24 w-full"
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
          {/* Duotone scrim — noche tint + mediterráneo overlay */}
          <div className="absolute inset-0 bg-mkt-noche/55 mix-blend-multiply" aria-hidden="true" />
          <div className="absolute inset-0 bg-mkt-mediterraneo/30 mix-blend-multiply" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-mkt-noche/80 via-mkt-noche/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-mkt-noche/50 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl lg:border-l-2 lg:border-accent lg:pl-10"
          >
            {/* Eyebrow */}
            <motion.p
              variants={item}
              className="mb-5 text-xs font-semibold uppercase tracking-widest text-accent/90"
            >
              {t("hero.eyebrow")}
            </motion.p>

            {/* Title */}
            <motion.h1
              variants={item}
              className="font-display text-5xl font-semibold leading-tight text-hero-fg hero-text-shadow sm:text-6xl lg:text-7xl"
            >
              {t("hero.title")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="mt-6 text-base leading-relaxed text-hero-fg/80 sm:text-lg"
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* CTAs */}
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
                <Link to="/contact">{t("hero.cta_consult")}</Link>
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
    </MeshGradientBackground>
  );
}

// ── Founder section ── 60/40 asymmetric grid ─────────────────────────────────

function FounderSection() {
  const { t } = useTranslation("home");
  return (
    <AuroraSection
      blobs={[
        { color: 'violeta', size: 'w-[400px] h-[320px]', position: '-top-20 -left-16' },
        { color: 'sol',     size: 'w-[360px] h-[280px]', position: '-bottom-16 -right-12' },
      ]}
      scrim="none"
      as="section"
      className="border-t border-line"
    >
      <div id="founder" className="grid md:grid-cols-5 gap-0">

        {/* Left (3 cols): text on azahar */}
        <div className="md:col-span-3 bg-mkt-azahar px-6 py-14 sm:py-20 lg:px-12">
          <FadeUp>
            <SectionLabel>{t("founder.label")}</SectionLabel>
            <SolRule className="mb-6" />
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {t("founder.name")}
            </h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-accent">
              {t("founder.role")}
            </p>
            <p className="mt-6 text-base leading-relaxed text-ink-secondary">
              {t("founder.bio3")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              {t("founder.bio4")}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
            >
              {t("founder.read_more")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </FadeUp>
        </div>

        {/* Right (2 cols, -mx-8 overlap): image on mediterráneo mesh */}
        <FadeUp delay={0.12} className="md:col-span-2 md:-mx-8">
          <MeshGradientBackground
            variant="mediterraneo"
            className="relative h-full min-h-80 overflow-hidden sm:min-h-96"
          >
            <img
              src="/imgs/brand/hero-media.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-mkt-noche/90 via-mkt-noche/50 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 px-7 pb-8 sm:px-8">
              <p className="font-display text-xl font-semibold text-mkt-azahar">
                {t("founder.name")}
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-mkt-sol">
                {t("founder.role")}
              </p>
            </div>
          </MeshGradientBackground>
        </FadeUp>

      </div>
    </AuroraSection>
  );
}

// ── Stats counter strip ──────────────────────────────────────────────────────

const STATS = [
  { value: 50, suffix: "+", labelKey: "stats.s1_label" },
  { value: 10, suffix: "+", labelKey: "stats.s2_label" },
  { value: 3,  suffix: "",  labelKey: "stats.s3_label" },
  { value: 100, suffix: "%", labelKey: "stats.s4_label" },
] as const;

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, value, motionValue, prefersReducedMotion]);

  return (
    <span ref={ref} className="inline-flex items-baseline gap-0.5">
      <motion.span>{rounded}</motion.span>
      <span aria-hidden="true">{suffix}</span>
    </span>
  );
}

function StatsStripSection() {
  const { t } = useTranslation("home");
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      className="relative border-y border-line bg-accent-soft"
      aria-label={t("stats.aria_label")}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-canvas-subtle to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-canvas to-transparent" />
      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <dl className="flex flex-col items-center lg:flex-row lg:justify-center">
          {STATS.map(({ value, suffix, labelKey }, i) => (
            <Fragment key={labelKey}>
              <motion.div
                className="flex flex-col items-center gap-1 px-8 py-10 text-center lg:flex-1"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              >
                <dt className="font-display text-4xl font-semibold text-brand sm:text-5xl">
                  <AnimatedNumber value={value} suffix={suffix} />
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink-secondary">
                  {t(labelKey)}
                </dd>
              </motion.div>
              {i < STATS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="flex shrink-0 flex-row items-center gap-2 py-2 lg:flex-col lg:py-0 lg:px-4"
                >
                  <span className="block h-px w-10 bg-accent/40 lg:h-8 lg:w-px" />
                  <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="block h-px w-10 bg-accent/40 lg:h-8 lg:w-px" />
                </span>
              )}
            </Fragment>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ── Services showcase — vibrant bento grid ───────────────────────────────────

function BentoServicesShowcase() {
  const { t } = useTranslation("home");
  const highlights = t("services.s02_highlights", {
    returnObjects: true,
  }) as string[];

  return (
    <AuroraSection
      blobs={[
        { color: 'fiesta',       size: 'w-[400px] h-[320px]', position: '-top-20 -left-16' },
        { color: 'mediterraneo', size: 'w-[360px] h-[280px]', position: '-bottom-16 -right-12' },
      ]}
      scrim="none"
      as="section"
      className="border-t border-line bg-canvas py-16 sm:py-24"
    >
      <div id="services-preview" className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-10 max-w-2xl">
          <SectionLabel>{t("services.label")}</SectionLabel>
          <SolRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t("services.subtitle")}
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Lead tile s02 — colSpan=2, glass-dark */}
          <FadeUp className="md:col-span-2">
            <BentoCell colSpan={2} tone="glass-dark" className="h-full">
              <Link to="/services#s02" className="group flex flex-col h-full min-h-[280px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-ui-md bg-white/10">
                    <GraduationCap className="h-7 w-7 text-mkt-sol" aria-hidden />
                  </span>
                  <span className="font-display text-6xl font-bold leading-none text-mkt-azahar/15" aria-hidden="true">
                    {t("services.s02_number")}
                  </span>
                </div>
                <div className="mt-8">
                  <SectionLabel>{t("services.s02_label")}</SectionLabel>
                  <h3 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                    {t("services.s02_title")}
                  </h3>
                </div>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-mkt-azahar/80">
                  {t("services.s02_teaser")}
                </p>
                <div className="mt-auto pt-10">
                  {Array.isArray(highlights) && highlights.length > 0 && (
                    <ul className="flex flex-col gap-3 border-t border-white/15 pt-6">
                      {highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3 text-sm font-medium"
                        >
                          <CheckCircle2
                            className="h-4 w-4 flex-shrink-0 text-mkt-sol"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span
                    className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold text-mkt-sol opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    {t("services.s02_cta")} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </BentoCell>
          </FadeUp>

          {/* s01 — noche */}
          <FadeUp delay={0.1}>
            <BentoCell tone="noche" className="h-full">
              <Link to="/services#s01" className="group flex flex-col h-full min-h-[200px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-ui-sm bg-white/10">
                    <Languages className="h-5 w-5 text-mkt-sol" aria-hidden />
                  </span>
                  <span className="font-display text-4xl font-bold leading-none text-mkt-azahar/15" aria-hidden="true">
                    {t("services.s01_number")}
                  </span>
                </div>
                <div className="mt-6">
                  <SectionLabel>{t("services.s01_label")}</SectionLabel>
                  <h3 className="mt-1 font-display text-lg font-semibold">
                    {t("services.s01_title")}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mkt-azahar/75">
                  {t("services.s01_teaser")}
                </p>
                <span
                  className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold text-mkt-sol opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden="true"
                >
                  {t("services.s01_cta")} <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </BentoCell>
          </FadeUp>

          {/* s03 — mediterráneo */}
          <FadeUp delay={0.15}>
            <BentoCell tone="mediterraneo" className="h-full">
              <Link to="/services#s03" className="group flex flex-col h-full min-h-[200px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-ui-sm bg-white/10">
                    <Tent className="h-5 w-5 text-mkt-azahar" aria-hidden />
                  </span>
                  <span className="font-display text-4xl font-bold leading-none text-mkt-azahar/15" aria-hidden="true">
                    {t("services.s03_number")}
                  </span>
                </div>
                <div className="mt-6">
                  <SectionLabel>{t("services.s03_label")}</SectionLabel>
                  <h3 className="mt-1 font-display text-lg font-semibold">
                    {t("services.s03_title")}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mkt-azahar/75">
                  {t("services.s03_teaser")}
                </p>
                <span
                  className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold text-mkt-azahar opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden="true"
                >
                  {t("services.s03_cta")} <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </BentoCell>
          </FadeUp>

          {/* s04 — noche, colSpan=2 */}
          <FadeUp delay={0.2} className="md:col-span-2">
            <BentoCell colSpan={2} tone="noche" className="h-full">
              <Link to="/services#s04" className="group flex flex-col h-full min-h-[160px] sm:flex-row sm:items-stretch">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 sm:w-1/4 sm:flex-col sm:items-start sm:justify-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
                  <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-ui-md bg-white/10">
                    <Lightbulb className="h-6 w-6 text-mkt-sol" aria-hidden />
                  </span>
                  <span className="font-display text-5xl font-bold leading-none text-mkt-azahar/15 sm:mt-5" aria-hidden="true">
                    {t("services.s04_number")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col pt-4 sm:pt-0 sm:pl-6">
                  <SectionLabel>{t("services.s04_label")}</SectionLabel>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    {t("services.s04_title")}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-mkt-azahar/75">
                    {t("services.s04_teaser")}
                  </p>
                  <span
                    className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold text-mkt-sol opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    {t("services.s04_cta")} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </BentoCell>
          </FadeUp>

        </div>
      </div>
    </AuroraSection>
  );
}

// ── Standout — four differentiators ──────────────────────────────────────────

const STANDOUT_ICONS: LucideIcon[] = [Compass, GraduationCap, Eye, HeartHandshake];

function StandoutSection() {
  const { t } = useTranslation("home");
  const items = (["i01", "i02", "i03", "i04"] as const).map((key, i) => ({
    key,
    Icon: STANDOUT_ICONS[i],
    title: t(`standout.${key}_title`),
    body: t(`standout.${key}_body`),
  }));

  return (
    <section id="why-us" className="bg-canvas-subtle border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-10 max-w-2xl">
          <SectionLabel>{t("standout.label")}</SectionLabel>
          <SolRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("standout.title")}
          </h2>
        </FadeUp>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, Icon, title, body }, i) => (
            <FadeUp key={key} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-ui-lg border border-line bg-canvas p-6 shadow-ui-1">
                <span className="mb-5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-ui-md bg-accent-soft">
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                </span>
                <h3 className="font-display text-base font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works — trajectory wave timeline → /about ─────────────────────────

const HIW_STEPS = [
  { key: "s01", Icon: MessagesSquare },
  { key: "s02", Icon: Compass },
  { key: "s03", Icon: ClipboardCheck },
  { key: "s04", Icon: HeartHandshake },
] as const;

function HowItWorksTeaser() {
  const { t } = useTranslation("home");
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="how-it-works-teaser" className="bg-canvas border-t border-line py-14 sm:py-20 overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">

        <FadeUp className="mb-12 max-w-2xl">
          <SectionLabel>{t("how_we_work.label")}</SectionLabel>
          <SolRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("how_we_work.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t("how_we_work.home_intro")}
          </p>
        </FadeUp>

        <div className="relative">

          {/* Mobile: animated left spine rail */}
          <div className="lg:hidden" aria-hidden="true">
            <SpineRail railClass="bg-accent" />
          </div>

          {/* Desktop: decorative wave path — draws L→R on scroll */}
          <motion.svg
            aria-hidden="true"
            className="pointer-events-none absolute hidden lg:block inset-0 w-full h-full"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <motion.path
              d="M 125,75 C 250,75 250,25 375,25 C 500,25 500,75 625,75 C 750,75 750,25 875,25"
              stroke="currentColor"
              className="text-accent"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              initial={prefersReducedMotion ? { opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
              whileInView={prefersReducedMotion ? {} : { pathLength: 1, opacity: 0.55 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                pathLength: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.3 },
              }}
            />
          </motion.svg>

          <ol className="relative flex flex-col gap-10 lg:grid lg:grid-cols-4 lg:gap-8 lg:h-80">
            {HIW_STEPS.map(({ key, Icon }, i) => {
              const isTop = i % 2 === 0;
              const nodeDelay = ([0.15, 0.5, 0.85, 1.2] as const)[i];
              const contentDelay = ([0.25, 0.65, 1.0, 1.35] as const)[i];
              return (
                <li key={key} className="relative flex flex-col items-start pl-10 sm:pl-14 lg:pl-0 lg:items-center lg:h-full">

                  {/* Mobile: node on the spine rail */}
                  <SpineNode className="lg:hidden top-2.5" dotClass="bg-accent ring-accent/30" />

                  {isTop ? (
                    <>
                      <FadeUp delay={prefersReducedMotion ? 0 : contentDelay} className="lg:text-center lg:mt-8">
                        <div className="flex items-center gap-3 mb-2 lg:flex-col lg:items-center lg:gap-2">
                          <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-ui-sm bg-accent-soft">
                            <Icon className="h-4 w-4 text-accent" aria-hidden />
                          </span>
                          <h3 className="font-display text-base font-semibold text-ink">
                            {t(`how_we_work.${key}_title`)}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed text-ink-secondary">
                          {t(`how_we_work.${key}_body`)}
                        </p>
                      </FadeUp>
                      <motion.div
                        className="hidden lg:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent bg-canvas ring-4 ring-accent/10 lg:absolute lg:top-3/4 lg:left-1/2 z-10"
                        style={{ x: "-50%", y: "-50%" }}
                        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
                        whileInView={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: nodeDelay, duration: 0.3, type: "spring", bounce: 0.3 }}
                      >
                        <span aria-hidden="true" className="font-display text-sm font-bold text-accent">
                          {t(`how_we_work.${key}_number`)}
                        </span>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        className="hidden lg:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent bg-canvas ring-4 ring-accent/10 lg:absolute lg:top-1/4 lg:left-1/2 z-10"
                        style={{ x: "-50%", y: "-50%" }}
                        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
                        whileInView={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: nodeDelay, duration: 0.3, type: "spring", bounce: 0.3 }}
                      >
                        <span aria-hidden="true" className="font-display text-sm font-bold text-accent">
                          {t(`how_we_work.${key}_number`)}
                        </span>
                      </motion.div>
                      <div className="hidden lg:block lg:h-1/4 lg:shrink-0" aria-hidden="true" />
                      <FadeUp delay={prefersReducedMotion ? 0 : contentDelay} className="lg:text-center lg:mt-8">
                        <div className="flex items-center gap-3 mb-2 lg:flex-col lg:items-center lg:gap-2">
                          <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-ui-sm bg-accent-soft">
                            <Icon className="h-4 w-4 text-accent" aria-hidden />
                          </span>
                          <h3 className="font-display text-base font-semibold text-ink">
                            {t(`how_we_work.${key}_title`)}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed text-ink-secondary">
                          {t(`how_we_work.${key}_body`)}
                        </p>
                      </FadeUp>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <FadeUp delay={0.2} className="mt-14 flex justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="border border-line text-brand hover:border-brand hover:bg-accent-soft"
            asChild
          >
            <Link to="/about">
              {t("how_we_work.home_cta")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </FadeUp>
      </div>
    </section>
  );
}

// ── FAQ teaser ────────────────────────────────────────────────────────────────

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

function FaqTeaserSection() {
  const { t } = useTranslation("home");
  return (
    <section id="faq-teaser" className="bg-canvas-subtle border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-10 max-w-2xl">
          <SectionLabel>{t("faq.label")}</SectionLabel>
          <SolRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("faq.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t("faq.subtitle")}
          </p>
        </FadeUp>

        <dl className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {FAQ_KEYS.map((k, i) => (
            <FadeUp key={k} delay={i * 0.07}>
              <Link
                to={t(`faq.${k}_link`)}
                className="group flex h-full flex-col rounded-ui-lg border border-line bg-canvas p-6 transition-colors hover:border-accent hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                <dt className="font-display text-sm font-semibold text-ink group-hover:text-accent sm:text-base transition-colors">
                  {t(`faq.${k}_question`)}
                </dt>
                <dd className="mt-3 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {t(`faq.${k}_answer`)}
                </dd>
                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("faq.read_more")} <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
            </FadeUp>
          ))}
        </dl>

        <FadeUp delay={0.25} className="mt-10 flex justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="border border-line text-brand hover:border-brand hover:bg-accent-soft"
            asChild
          >
            <Link to="/elite-guide">
              {t("faq.cta_more")}
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
    <MeshGradientBackground as="section" variant="noche" className="py-14 sm:py-20">
      <FadeUp className="px-4 sm:px-6">
        <GlassCard tone="dark" className="mx-auto max-w-2xl p-8 sm:p-12">
          <div className="text-center">
            <VibrantSectionLabel className="mb-4">{t("hero.eyebrow")}</VibrantSectionLabel>
            <h2 className="font-display text-3xl font-semibold text-mkt-azahar sm:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-mkt-azahar/80">
              {t("cta.body")}
            </p>
            <div className="mt-8">
              <motion.div
                className="inline-block"
                variants={magneticCta}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.97 }}
              >
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
              </motion.div>
            </div>
          </div>
        </GlassCard>
      </FadeUp>
    </MeshGradientBackground>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FounderSection />
      <StatsStripSection />
      <BentoServicesShowcase />
      <StandoutSection />
      <HowItWorksTeaser />
      <FaqTeaserSection />
      <FinalCTASection />
    </div>
  );
}
