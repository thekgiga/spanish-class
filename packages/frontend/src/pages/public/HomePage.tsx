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
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  GoldRule,
  SectionLabel,
  SpineRail,
  SpineNode,
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
      className="relative flex min-h-screen items-center overflow-hidden bg-hero-bg py-16 sm:py-24"
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
    <section id="intro" className="bg-canvas border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

          <FadeUp>
            <SectionLabel>{t("about.label")}</SectionLabel>
            <GoldRule className="mb-6" />
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {t("about.title")}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-secondary">
              {t("about.body1")}
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
            <div className="relative h-full min-h-80 overflow-hidden rounded-ui-lg">
              <img
                src="/imgs/brand/hero-media.webp"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent"
                aria-hidden="true"
              />
              <blockquote className="absolute inset-x-0 bottom-0 px-7 pb-8 pt-20 sm:px-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                  {t("about.mission_label")}
                </p>
                <GoldRule className="mb-5" />
                <p className="font-display text-lg font-medium italic leading-relaxed text-ink-inverse sm:text-xl">
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-canvas to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-canvas-subtle to-transparent" />
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

// ── Services showcase — bento asymmetric grid ────────────────────────────────

const SERVICE_ICONS: Record<string, LucideIcon> = {
  s01: Languages,
  s02: GraduationCap,
  s03: Tent,
  s04: Lightbulb,
};

// Editorial tile header: an accent icon chip paired with the service's large
// display number. Replaces the former baked-in-text card graphic, which could
// not localise and named a different service than the tile copy beneath it.
function TileHead({
  icon: Icon,
  number,
  size = "sm",
}: {
  icon: LucideIcon;
  number: string;
  size?: "sm" | "lg";
}) {
  const chip =
    size === "lg" ? "h-14 w-14 rounded-ui-md" : "h-11 w-11 rounded-ui-sm";
  const glyph = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const num = size === "lg" ? "text-6xl" : "text-4xl";
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`inline-flex flex-shrink-0 items-center justify-center bg-accent-soft ${chip}`}
      >
        <Icon className={`${glyph} text-accent`} aria-hidden />
      </span>
      <span className={`font-display font-bold leading-none text-ink/15 ${num}`} aria-hidden="true">
        {number}
      </span>
    </div>
  );
}

// Reveal-on-hover / always-visible-on-focus "Find out more" affordance.
function FindOutMore({ label }: { label: string }) {
  return (
    <span
      className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold text-brand opacity-0 transition-opacity duration-standard group-hover:opacity-100 group-focus-visible:opacity-100"
      aria-hidden="true"
    >
      {label} <ArrowRight className="h-3 w-3" />
    </span>
  );
}

const TILE_CHROME =
  "group relative flex h-full flex-col rounded-ui-lg border border-line bg-canvas shadow-ui-1 transition-all duration-standard ease-ui-standard hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-ui-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

function BentoServicesShowcase() {
  const { t } = useTranslation("home");
  const highlights = t("services.s01_highlights", {
    returnObjects: true,
  }) as string[];

  return (
    <section id="services-preview" className="bg-canvas-subtle border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-10 max-w-2xl">
          <SectionLabel>{t("services.label")}</SectionLabel>
          <GoldRule className="mb-6" />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t("services.subtitle")}
          </p>
        </FadeUp>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr">
          {/* Lead tile — primary one-to-one teaching product */}
          <FadeUp className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
            <Link to="/services#s01" className={TILE_CHROME}>
              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <TileHead
                  icon={SERVICE_ICONS.s01}
                  number={t("services.s01_number")}
                  size="lg"
                />
                <div className="mt-8">
                  <SectionLabel>{t("services.s01_label")}</SectionLabel>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
                    {t("services.s01_title")}
                  </h3>
                </div>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-secondary">
                  {t("services.s01_teaser")}
                </p>
                <div className="mt-auto pt-10">
                  {Array.isArray(highlights) && highlights.length > 0 && (
                    <ul className="flex flex-col gap-3 border-t border-line pt-6">
                      {highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3 text-sm font-medium text-ink"
                        >
                          <CheckCircle2
                            className="h-4 w-4 flex-shrink-0 text-brand"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  <FindOutMore label={t("services.s01_cta")} />
                </div>
              </div>
            </Link>
          </FadeUp>

          {/* Small tiles */}
          {(["s02", "s03"] as const).map((key, i) => (
            <FadeUp key={key} delay={[0.1, 0.2][i]}>
              <Link to={`/services#${key}`} className={TILE_CHROME}>
                <div className="flex flex-1 flex-col p-6">
                  <TileHead
                    icon={SERVICE_ICONS[key]}
                    number={t(`services.${key}_number`)}
                  />
                  <div className="mt-6">
                    <SectionLabel>{t(`services.${key}_label`)}</SectionLabel>
                    <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                      {t(`services.${key}_title`)}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {t(`services.${key}_teaser`)}
                  </p>
                  <FindOutMore label={t(`services.${key}_cta`)} />
                </div>
              </Link>
            </FadeUp>
          ))}

          {/* Wide banner tile */}
          <FadeUp delay={0.3} className="sm:col-span-2 lg:col-span-3">
            <Link
              to="/services#s04"
              className={`${TILE_CHROME} sm:flex-row sm:items-stretch`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-line p-6 sm:w-1/4 sm:flex-col sm:items-start sm:justify-center sm:border-b-0 sm:border-r sm:p-8">
                <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-ui-md bg-accent-soft">
                  <Lightbulb className="h-6 w-6 text-accent" aria-hidden />
                </span>
                <span className="font-display text-5xl font-bold leading-none text-ink/15 sm:mt-5" aria-hidden="true">
                  {t("services.s04_number")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <SectionLabel>{t("services.s04_label")}</SectionLabel>
                <h3 className="mt-1 font-display text-xl font-semibold text-ink">
                  {t("services.s04_title")}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-secondary">
                  {t("services.s04_teaser")}
                </p>
                <FindOutMore label={t("services.s04_cta")} />
              </div>
            </Link>
          </FadeUp>
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
          <GoldRule className="mb-6" />
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
            <SpineRail railClass="bg-feedback-danger" />
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
              className="text-feedback-danger"
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

          {/* lg:h-80 fixes the grid row height so the SVG path Y=25/75 maps exactly
              to top-1/4 / top-3/4 — the circle absolute positions below. */}
          <ol className="relative flex flex-col gap-10 lg:grid lg:grid-cols-4 lg:gap-8 lg:h-80">
            {HIW_STEPS.map(({ key, Icon }, i) => {
              const isTop = i % 2 === 0;
              const nodeDelay = ([0.15, 0.5, 0.85, 1.2] as const)[i];
              const contentDelay = ([0.25, 0.65, 1.0, 1.35] as const)[i];
              return (
                <li key={key} className="relative flex flex-col items-start pl-10 sm:pl-14 lg:pl-0 lg:items-center lg:h-full">

                  {/* Mobile: node on the spine rail */}
                  <SpineNode className="lg:hidden top-2.5" dotClass="bg-feedback-danger ring-feedback-danger/30" />

                  {isTop ? (
                    // Steps 1 & 3 — content at top, circle pinned at 75% of row height
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
                    // Steps 2 & 4 — circle pinned at 25% of row height, content below
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
                      {/* spacer reserves the top quarter so FadeUp starts below the circle */}
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

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTASection() {
  const { t } = useTranslation("home");
  return (
    <section className="relative z-10 bg-hero-bg py-14 sm:py-20">
      <FadeUp className="mx-auto max-w-2xl px-4 text-center sm:px-6">
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
      <StatsStripSection />
      <BentoServicesShowcase />
      <HowItWorksTeaser />
      <FinalCTASection />
    </div>
  );
}
