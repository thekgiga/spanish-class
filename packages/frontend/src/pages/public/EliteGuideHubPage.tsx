import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GraduationCap, BookOpen, MapPin, Compass, Tent, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GUIDE_ARTICLES, GUIDE_RUBRIC_ORDER, type GuideRubric } from "@/content/elite-guide";

const RUBRIC_ICONS: Record<GuideRubric, React.ElementType> = {
  study: GraduationCap,
  learn: BookOpen,
  live: MapPin,
  experience: Compass,
  camps: Tent,
  insights: Lightbulb,
};

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

function ArticleCard({ slug, rubric, titleKey, excerptKey, heroImage }: {
  slug: string;
  rubric: GuideRubric;
  titleKey: string;
  excerptKey: string;
  heroImage?: string;
}) {
  const { t } = useTranslation("elite-guide");
  const Icon = RUBRIC_ICONS[rubric];
  return (
    <Link
      to={`/elite-guide/${slug}`}
      className="group flex flex-col rounded-ui-lg border border-line bg-canvas overflow-hidden hover:shadow-ui-2 transition-shadow duration-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
    >
      {heroImage && (
        <div className="relative h-44 overflow-hidden bg-surface">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-spatial"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t(`hub.rubric_${rubric}`)}
          </span>
        </div>
        <h2 className="font-display text-lg font-semibold leading-snug text-ink group-hover:text-brand transition-colors">
          {t(titleKey)}
        </h2>
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

export function EliteGuideHubPage() {
  const { t } = useTranslation("elite-guide");
  const [activeRubric, setActiveRubric] = useState<GuideRubric | "all">("all");

  const filtered = activeRubric === "all"
    ? GUIDE_ARTICLES
    : GUIDE_ARTICLES.filter((a) => a.rubric === activeRubric);

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

      {/* Filter + Grid */}
      <section className="bg-canvas py-14 sm:py-20">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
          {/* Rubric filter */}
          <FadeUp>
            <div
              className="mb-10 flex flex-wrap gap-2"
              role="group"
              aria-label={t("hub.filter_label")}
            >
              <FilterButton
                label={t("hub.rubric_all")}
                active={activeRubric === "all"}
                onClick={() => setActiveRubric("all")}
              />
              {GUIDE_RUBRIC_ORDER.map((rubric) => (
                <FilterButton
                  key={rubric}
                  label={t(`hub.rubric_${rubric}`)}
                  active={activeRubric === rubric}
                  onClick={() => setActiveRubric(rubric)}
                />
              ))}
            </div>
          </FadeUp>

          {filtered.length === 0 ? (
            <p className="text-ink-secondary text-small">{t("hub.articles_empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((article, i) => (
                <FadeUp key={article.slug} delay={i * 0.04}>
                  <ArticleCard
                    slug={article.slug}
                    rubric={article.rubric}
                    titleKey={article.titleKey}
                    excerptKey={article.excerptKey}
                    heroImage={article.heroImage}
                  />
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function FilterButton({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-ui-full px-4 py-1.5 text-small font-semibold bg-brand text-brand-contrast transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          : "rounded-ui-full px-4 py-1.5 text-small font-semibold border border-line text-ink-secondary hover:border-brand hover:text-brand transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      }
    >
      {label}
    </button>
  );
}
