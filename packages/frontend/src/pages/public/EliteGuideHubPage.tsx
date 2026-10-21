import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GraduationCap, BookOpen, MapPin, Compass, Tent, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  GUIDE_ARTICLES,
  GUIDE_THEME_ORDER,
  type GuideRubric,
  type GuideTheme,
  type GuideArticleMeta,
} from "@/content/elite-guide";

const RUBRIC_ICONS: Record<GuideRubric, React.ElementType> = {
  study: GraduationCap,
  learn: BookOpen,
  live: MapPin,
  experience: Compass,
  camps: Tent,
  insights: Lightbulb,
};

const THEME_ICONS: Record<GuideTheme, React.ElementType> = {
  study: GraduationCap,
  language: BookOpen,
  living: MapPin,
  stories: Compass,
};

/** Top-of-page intent shortcuts. `anchor` targets a theme section id below. */
const PATHS: { key: string; anchor: string; Icon: React.ElementType }[] = [
  { key: "study", anchor: "guide-study", Icon: GraduationCap },
  { key: "language", anchor: "guide-language", Icon: BookOpen },
  { key: "camps", anchor: "guide-stories", Icon: Tent },
];

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
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

function ArticleCard({ slug, rubric, titleKey, excerptKey }: {
  slug: string;
  rubric: GuideRubric;
  titleKey: string;
  excerptKey: string;
}) {
  const { t } = useTranslation("elite-guide");
  const Icon = RUBRIC_ICONS[rubric];
  return (
    <Link
      to={`/elite-guide/${slug}`}
      className="group flex h-full flex-col rounded-ui-lg border border-line bg-canvas overflow-hidden hover:shadow-ui-2 transition-shadow duration-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t(`hub.rubric_${rubric}`)}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:text-brand transition-colors">
          {t(titleKey)}
        </h3>
        <p className="mt-2 flex-1 text-small leading-relaxed text-ink-secondary line-clamp-3">
          {t(excerptKey)}
        </p>
        <div className="mt-4 flex items-center gap-1 text-small font-semibold text-accent">
          {t("article.read_more")}
          <ArrowRight className="h-3.5 w-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

/** Cornerstone "Start here" entry point — the single front door for newcomers. */
function StartHereCard({ slug }: { slug: string }) {
  const { t } = useTranslation("elite-guide");
  return (
    <section className="bg-canvas pt-14 sm:pt-20">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="rounded-ui-lg border border-line bg-surface p-6 sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              {t("start_here.label")}
            </p>
            <h2 className="max-w-2xl font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
              {t("start_here.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
              {t("start_here.body")}
            </p>
            <Button variant="primary" size="lg" className="mt-6" asChild>
              <Link to={`/elite-guide/${slug}`}>
                {t("start_here.cta")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/** Intent shortcuts so a student or parent can self-select their path. */
function PathsRow() {
  const { t } = useTranslation("elite-guide");
  return (
    <section className="bg-canvas pt-12 sm:pt-16">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            {t("paths.heading")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {PATHS.map(({ key, anchor, Icon }) => (
              <a
                key={key}
                href={`#${anchor}`}
                className="group flex items-start gap-3 rounded-ui-lg border border-line bg-surface p-5 hover:border-brand transition-colors duration-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ui-md bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-small font-semibold text-ink group-hover:text-brand transition-colors">
                    {t(`paths.${key}.title`)}
                  </span>
                  <span className="mt-1 text-caption leading-relaxed text-ink-tertiary">
                    {t(`paths.${key}.description`)}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/** One visitor-facing theme: label + "who it's for" line + its article cards. */
function ThemeSection({ theme, articles }: { theme: GuideTheme; articles: GuideArticleMeta[] }) {
  const { t } = useTranslation("elite-guide");
  const Icon = THEME_ICONS[theme];
  return (
    <section id={`guide-${theme}`} tabIndex={-1} className="scroll-mt-24 focus:outline-none">
      <FadeUp>
        <div className="flex items-start gap-3 border-b border-line pb-4">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              {t(`themes.${theme}.label`)}
            </h2>
            <p className="mt-1 max-w-2xl text-small leading-relaxed text-ink-secondary">
              {t(`themes.${theme}.description`)}
            </p>
          </div>
        </div>
      </FadeUp>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <FadeUp key={article.slug} delay={i * 0.04}>
            <ArticleCard
              slug={article.slug}
              rubric={article.rubric}
              titleKey={article.titleKey}
              excerptKey={article.excerptKey}
            />
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

export function EliteGuideHubPage() {
  const { t } = useTranslation("elite-guide");
  const featured = GUIDE_ARTICLES.find((a) => a.featured);
  const sections = GUIDE_THEME_ORDER
    .map((theme) => ({
      theme,
      articles: GUIDE_ARTICLES.filter((a) => a.theme === theme && !a.featured),
    }))
    .filter((s) => s.articles.length > 0);

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand py-20 sm:py-28">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              {t("hub.hero_label")}
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-brand-contrast sm:text-5xl">
              {t("hub.hero_title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-contrast/80">
              {t("hub.hero_subtitle")}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Start here — single guided entry point */}
      {featured && <StartHereCard slug={featured.slug} />}

      {/* Choose your path — intent shortcuts for student vs parent */}
      <PathsRow />

      {/* Themed sections — grouped by what the visitor actually wants */}
      <section className="bg-canvas pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-screen-lg space-y-16 px-4 sm:space-y-20 sm:px-6 lg:px-8">
          {sections.length === 0 ? (
            <p className="text-small text-ink-secondary">{t("hub.articles_empty")}</p>
          ) : (
            sections.map((s) => (
              <ThemeSection key={s.theme} theme={s.theme} articles={s.articles} />
            ))
          )}
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="bg-brand py-16">
        <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-brand-contrast sm:text-3xl">
            {t("article.cta_label")}
          </h2>
          <p className="mt-3 text-base text-brand-contrast/80">{t("article.cta_body")}</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-6 bg-surface text-brand hover:bg-canvas focus-visible:ring-accent"
            asChild
          >
            <Link to="/contact">
              {t("article.cta_button")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
