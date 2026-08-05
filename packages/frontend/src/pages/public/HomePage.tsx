import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
  MotionValue,
} from "framer-motion";
import {
  Calendar,
  Video,
  Users,
  Star,
  ArrowRight,
  Globe,
  Award,
  MessageCircle,
  BookOpen,
  Target,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMediaQuery";

// ── Types ───────────────────────────────────────────────────────────────────

interface PaellaStep {
  labelKey: string;
  copyKey: string;
}

// ── Data ────────────────────────────────────────────────────────────────────

/** The paella cooking video, scrubbed by scroll. Landscape for desktop,
    square crop for mobile so the whole pan stays visible on tall screens. */
const PAELLA_VIDEO_DESKTOP = "/imgs/paella-cook.mp4";
const PAELLA_VIDEO_MOBILE = "/imgs/paella-cook-mobile.mp4";
const PAELLA_POSTER_DESKTOP = "/imgs/paella-poster.webp";
const PAELLA_POSTER_MOBILE = "/imgs/paella-poster-mobile.webp";

/** Narrative steps overlaid on the video at evenly-spaced scroll thresholds. */
const PAELLA_STEPS: PaellaStep[] = [
  { labelKey: "paella.step1_label", copyKey: "paella.step1_copy" },
  { labelKey: "paella.step2_label", copyKey: "paella.step2_copy" },
  { labelKey: "paella.step3_label", copyKey: "paella.step3_copy" },
  { labelKey: "paella.step4_label", copyKey: "paella.step4_copy" },
  { labelKey: "paella.step5_label", copyKey: "paella.step5_copy" },
];

const N = PAELLA_STEPS.length;

const featuresConfig = [
  { icon: Video,    titleKey: "features.video_title",    descriptionKey: "features.video_description" },
  { icon: Calendar, titleKey: "features.calendar_title", descriptionKey: "features.calendar_description" },
  { icon: Users,    titleKey: "features.users_title",    descriptionKey: "features.users_description" },
  { icon: Globe,    titleKey: "features.globe_title",    descriptionKey: "features.globe_description" },
] as const;

const benefitsConfig = [
  { icon: Award,         titleKey: "benefits.dele_title",         descriptionKey: "benefits.dele_description" },
  { icon: BookOpen,      titleKey: "benefits.university_title",   descriptionKey: "benefits.university_description" },
  { icon: MessageCircle, titleKey: "benefits.conversation_title", descriptionKey: "benefits.conversation_description" },
  { icon: Target,        titleKey: "benefits.personalized_title", descriptionKey: "benefits.personalized_description" },
] as const;

const testimonialsConfig = [
  { nameKey: "testimonials.sarah_name", roleKey: "testimonials.sarah_role", contentKey: "testimonials.sarah_content", rating: 5, initials: "SM" },
  { nameKey: "testimonials.james_name", roleKey: "testimonials.james_role", contentKey: "testimonials.james_content", rating: 5, initials: "JL" },
  { nameKey: "testimonials.emily_name", roleKey: "testimonials.emily_role", contentKey: "testimonials.emily_content", rating: 5, initials: "ER" },
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Derive copy-block opacity for step i. */
function useCopyOpacity(scrollYProgress: MotionValue<number>, i: number): MotionValue<number> {
  const start = i / N;
  const end = (i + 1) / N;
  const inputRange = i === 0
    ? [0, end - 0.04, end]
    : i === N - 1
      ? [start - 0.02, start + 0.04]
      : [start - 0.02, start + 0.04, end - 0.04, end];
  const outputRange = i === 0
    ? [1, 1, 0]
    : i === N - 1
      ? [0, 1]
      : [0, 1, 1, 0];
  return useTransform(scrollYProgress, inputRange, outputRange);
}

/** Derive copy-block vertical translate for step i. */
function useCopyY(scrollYProgress: MotionValue<number>, i: number): MotionValue<number> {
  const start = i / N;
  return useTransform(scrollYProgress, [start - 0.02, start + 0.04], [16, 0]);
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface CopyLayerProps {
  step: PaellaStep;
  index: number;
  scrollYProgress: MotionValue<number>;
}

function CopyLayer({ step, index, scrollYProgress }: CopyLayerProps) {
  const { t } = useTranslation("home");
  const opacity = useCopyOpacity(scrollYProgress, index);
  const y = useCopyY(scrollYProgress, index);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-24 z-20 px-6 text-center sm:inset-x-auto sm:max-w-sm sm:px-0 sm:text-left sm:left-10 sm:bottom-16 lg:max-w-lg lg:left-16 lg:bottom-20"
    >
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-hero-label">
        {t(step.labelKey)}
      </p>
      <p className="font-display text-xl font-medium leading-snug text-hero-fg hero-text-shadow-sm sm:text-2xl lg:text-3xl">
        {t(step.copyKey)}
      </p>
    </motion.div>
  );
}

function PaellaScrollStory() {
  const { t } = useTranslation("home");
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  // rAF-throttling refs: only one seek is scheduled per animation frame
  const targetTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const videoSrc = isMobile ? PAELLA_VIDEO_MOBILE : PAELLA_VIDEO_DESKTOP;
  const posterSrc = isMobile ? PAELLA_POSTER_MOBILE : PAELLA_POSTER_DESKTOP;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the raw scroll progress so video scrubbing feels fluid, not jumpy.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Drive video.currentTime from smoothed scroll progress (0→1 maps to full clip).
  // The spring fires many times per frame; we coalesce those into a single seek
  // per animation frame via requestAnimationFrame, which is what keeps scrubbing
  // smooth instead of flooding the decoder with redundant seek requests.
  useMotionValueEvent(smoothProgress, "change", (progress) => {
    if (!videoDuration) return;
    const p = prefersReducedMotion
      ? Math.round(progress * (N - 1)) / (N - 1)
      : progress;
    targetTimeRef.current = Math.min(Math.max(p, 0), 1) * videoDuration;

    if (rafRef.current !== null) return; // a seek is already scheduled this frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const video = videoRef.current;
      if (!video) return;
      const target = targetTimeRef.current;
      // Skip micro-seeks (< half a frame at 24fps) to avoid decoder churn
      if (Math.abs(video.currentTime - target) > 0.02) {
        video.currentTime = target;
      }
    });
  });

  // Clean up any pending rAF on unmount
  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  // When the video source switches (crossing the mobile breakpoint), the
  // <video> reloads via its key — reset readiness so the poster covers the gap.
  useEffect(() => {
    setVideoReady(false);
    setVideoDuration(0);
  }, [videoSrc]);

  const ctaOpacity = useTransform(scrollYProgress, [0.82, 0.94], [0, 1]);
  // Keep the hero CTA out of the tab order / a11y tree until it has faded in,
  // so a keyboard user at the top of the page can't focus an invisible link.
  const ctaVisibility = useTransform(scrollYProgress, (p) =>
    p >= 0.82 ? "visible" : "hidden",
  );

  return (
    <div
      ref={containerRef}
      className="relative bg-hero-bg"
      style={{ height: `${N * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-hero-bg">

        {/* Blurred backdrop (mobile only). The square video is letterboxed via
            object-contain; this fills those bars with a soft, out-of-focus copy
            of the poster so the slate table appears to extend past the pan
            instead of showing flat black. Hidden on sm+ where the video is
            full-bleed. */}
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75 sm:hidden"
        />

        {/* Scroll-scrubbed cooking video. Landscape on desktop, square crop on
            mobile so the whole pan stays visible on tall screens. A lightweight
            WebP poster is layered on top until the clip is seek-ready, so the
            first paint is a sharp still — never a black box or partial frame. */}
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 h-full w-full object-contain sm:object-cover"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
          onCanPlayThrough={() => setVideoReady(true)}
          aria-hidden="true"
        />
        {/* Instant poster — fades out once the video can be scrubbed smoothly */}
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-contain sm:object-cover transition-opacity duration-500 ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Top+bottom gradients keep text legible over the footage */}
        <div className="absolute inset-0 bg-gradient-to-b from-hero-bg/60 via-transparent to-hero-bg/70" />

        {/* Sticky headline */}
        <div className="absolute inset-x-0 top-20 z-20 px-6 text-center sm:inset-x-auto sm:max-w-none sm:px-0 sm:text-left sm:left-10 sm:top-24 lg:left-16">
          <p className="font-display text-2xl font-semibold leading-tight text-hero-fg hero-text-shadow sm:text-3xl lg:text-4xl">
            {t("paella.sticky_headline")}
          </p>
        </div>

        {/* Per-step copy */}
        {PAELLA_STEPS.map((step, i) => (
          <CopyLayer key={step.labelKey} step={step} index={i} scrollYProgress={scrollYProgress} />
        ))}

        {/* CTA — appears on final step. On mobile it sits centered at the very
            bottom (below the step copy); on sm+ it moves to the bottom-right. */}
        <motion.div
          style={{ opacity: ctaOpacity, visibility: ctaVisibility }}
          className="absolute inset-x-6 bottom-4 z-20 flex justify-center sm:inset-x-auto sm:right-10 sm:bottom-16 sm:block lg:right-16 lg:bottom-20"
        >
          <Button
            variant="primary"
            size="lg"
            className="bg-hero-ctaBg text-hero-ctaFg hover:bg-hero-ctaHover focus-visible:ring-hero-progress"
            asChild
          >
            <Link to="/auth">
              {t("paella.cta")}
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Link>
          </Button>
        </motion.div>

        {/* Scroll progress bar */}
        <motion.div
          style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
          className="absolute bottom-0 left-0 right-0 z-30 h-progress-bar bg-hero-progress"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useTranslation("home");

  return (
    <div className="min-h-screen">

      {/* 1 — Paella scroll story */}
      <PaellaScrollStory />

      {/* Dark→light bridge. Also the sentinel the public Header observes to
          know the video hero has scrolled out of view (see Header.tsx).
          Tall gradient (32vh) softens the cinematic→editorial transition. */}
      <div
        id="landing-hero-end"
        className="h-64 bg-gradient-to-b from-hero-bg via-hero-bg/60 to-canvas"
        aria-hidden="true"
      />

      {/* 3 — Features grid */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
              {t("features.badge")}
            </p>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-secondary">
              {t("features.subtitle")}
            </p>
          </FadeUp>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuresConfig.map((f, i) => (
              <FadeUp key={f.titleKey} delay={i * 0.07}>
                <div className="rounded-xl border border-line bg-surface-raised p-6 transition-shadow duration-200 hover:shadow-ui-2">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft">
                    <f.icon className="h-5 w-5 text-accent" aria-hidden />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-ink">{t(f.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-ink-secondary">{t(f.descriptionKey)}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Benefits */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <FadeUp>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
                {t("benefits.badge")}
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                {t("benefits.title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                {t("benefits.subtitle")}
              </p>
              <ul className="mt-8 space-y-4" aria-label={t("benefits.title")}>
                {benefitsConfig.map((b, i) => (
                  <motion.li
                    key={b.titleKey}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4 rounded-lg border border-line bg-surface p-4"
                  >
                    <div className="flex-shrink-0 rounded-md bg-accent-soft p-2">
                      <b.icon className="h-4 w-4 text-accent" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{t(b.titleKey)}</p>
                      <p className="mt-0.5 text-sm text-ink-secondary">{t(b.descriptionKey)}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
              <Button variant="primary" size="lg" className="mt-8" asChild>
                <Link to="/auth">
                  {t("benefits.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl shadow-ui-3">
                <img
                  src="/imgs/paella-5.webp"
                  alt={t("benefits.image_alt")}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                <div className="absolute bottom-6 left-6 rounded-xl bg-surface/90 px-5 py-4 shadow-ui-2 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-ink">100%</p>
                  <p className="text-sm font-medium text-ink-secondary">{t("benefits.satisfaction")}</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 5 — Testimonials */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
              {t("testimonials.badge")}
            </p>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {t("testimonials.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-secondary">
              {t("testimonials.subtitle")}
            </p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonialsConfig.map((item, i) => (
              <FadeUp key={item.nameKey} delay={i * 0.08}>
                <figure className="flex h-full flex-col rounded-xl border border-line bg-surface-raised p-6">
                  <div
                    className="mb-4 flex gap-0.5"
                    role="img"
                    aria-label={t("testimonials.rating_aria", { rating: item.rating })}
                  >
                    {Array.from({ length: item.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-feedback-warning text-feedback-warning"
                        aria-hidden
                      />
                    ))}
                  </div>
                  <blockquote className="flex-1 text-sm leading-relaxed text-ink-secondary">
                    "{t(item.contentKey)}"
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-contrast"
                      aria-hidden
                    >
                      {item.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{t(item.nameKey)}</p>
                      <p className="text-xs text-ink-tertiary">{t(item.roleKey)}</p>
                    </div>
                  </figcaption>
                </figure>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Final CTA — dark cinematic section matching hero tone */}
      <section className="bg-hero-bg py-20">
        <FadeUp className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-hero-progress">
            {t("cta.badge")}
          </p>
          <h2 className="font-display text-3xl font-semibold text-hero-fg sm:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-hero-fg/70">
            {t("cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              className="bg-hero-ctaBg text-hero-ctaFg hover:bg-hero-ctaHover focus-visible:ring-hero-progress"
              asChild
            >
              <Link to="/auth">
                {t("cta.button_primary")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="border border-hero-fg/30 text-hero-fg hover:bg-hero-fg/10"
              asChild
            >
              <Link to="/contact">{t("cta.button_secondary")}</Link>
            </Button>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
