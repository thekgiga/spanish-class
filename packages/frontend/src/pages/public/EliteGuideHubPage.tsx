import { Link } from "react-router-dom";
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
import { MeshGradientBackground } from "@/components/marketing/MeshGradientBackground";
import { GlassCard } from "@/components/marketing/GlassCard";
import {
  SolRule,
  MarketingPageHeader,
  VibrantFadeUp,
} from "@/components/marketing/vibrant-helpers";

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
      className="group flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-mediterraneo))] focus-visible:ring-offset-2 rounded-2xl"
    >
      <GlassCard tone="light" interactive className="flex flex-1 flex-col h-full">
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-[hsl(var(--mkt-mediterraneo))] shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--mkt-mediterraneo))]">
              {t(`hub.rubric_${rubric}`)}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:text-[hsl(var(--mkt-mediterraneo))] transition-colors">
            {t(titleKey)}
          </h3>
          <p className="mt-2 flex-1 text-small leading-relaxed text-ink-secondary line-clamp-3">
            {t(excerptKey)}
          </p>
          <div className="mt-4 flex items-center gap-1 text-small font-semibold text-[hsl(var(--mkt-mediterraneo))]">
            {t("article.read_more")}
            <ArrowRight className="h-3.5 w-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

/** Cornerstone "Start here" entry point — the single front door for newcomers. */
function StartHereCard({ slug }: { slug: string }) {
  const { t } = useTranslation("elite-guide");
  return (
    <section className="bg-mkt-azahar pt-14 sm:pt-20">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <VibrantFadeUp>
          <div className="rounded-ui-lg border border-line bg-surface p-6 sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--mkt-mediterraneo))]">
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
        </VibrantFadeUp>
      </div>
    </section>
  );
}

/** Intent shortcuts so a student or parent can self-select their path. */
function PathsRow() {
  const { t } = useTranslation("elite-guide");
  return (
    <section className="bg-mkt-azahar pt-12 sm:pt-16">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <VibrantFadeUp>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            {t("paths.heading")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {PATHS.map(({ key, anchor, Icon }) => (
              <a
                key={key}
                href={`#${anchor}`}
                className="group flex items-start gap-3 rounded-ui-lg border border-line bg-surface p-5 hover:border-[hsl(var(--mkt-mediterraneo))] transition-colors duration-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-mediterraneo))] focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ui-md bg-accent-soft text-[hsl(var(--mkt-mediterraneo))]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-small font-semibold text-ink group-hover:text-[hsl(var(--mkt-mediterraneo))] transition-colors">
                    {t(`paths.${key}.title`)}
                  </span>
                  <span className="mt-1 text-caption leading-relaxed text-ink-tertiary">
                    {t(`paths.${key}.description`)}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </VibrantFadeUp>
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
      <VibrantFadeUp>
        <div className="flex items-start gap-3 border-b border-line pb-4">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--mkt-mediterraneo))]" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              {t(`themes.${theme}.label`)}
            </h2>
            <p className="mt-1 max-w-2xl text-small leading-relaxed text-ink-secondary">
              {t(`themes.${theme}.description`)}
            </p>
          </div>
        </div>
      </VibrantFadeUp>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <VibrantFadeUp key={article.slug} delay={i * 0.04}>
            <ArticleCard
              slug={article.slug}
              rubric={article.rubric}
              titleKey={article.titleKey}
              excerptKey={article.excerptKey}
            />
          </VibrantFadeUp>
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
      {/* Hero on noche mesh */}
      <MeshGradientBackground variant="noche" as="section" className="py-20 sm:py-28 px-4">
        <div className="mx-auto max-w-screen-lg sm:px-6 lg:px-8">
          <VibrantFadeUp>
            <MarketingPageHeader
              eyebrow={t("hub.hero_label")}
              title={t("hub.hero_title")}
              deck={t("hub.hero_subtitle")}
              align="center"
              tone="dark"
            />
          </VibrantFadeUp>
        </div>
      </MeshGradientBackground>

      {/* SolRule divider between header and content */}
      <div className="bg-mkt-azahar">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
          <SolRule className="pt-8" />
        </div>
      </div>

      {/* Start here — single guided entry point */}
      {featured && <StartHereCard slug={featured.slug} />}

      {/* Choose your path — intent shortcuts for student vs parent */}
      <PathsRow />

      {/* Themed sections — grouped by what the visitor actually wants */}
      <section className="bg-mkt-azahar pt-12 pb-16 sm:pt-16 sm:pb-24">
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

      {/* SolRule before CTA */}
      <div className="bg-mkt-azahar">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
          <SolRule />
        </div>
      </div>

      {/* Consultation CTA */}
      <section className="bg-mkt-noche py-16">
        <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-[hsl(var(--mkt-azahar))] sm:text-3xl">
            {t("article.cta_label")}
          </h2>
          <p className="mt-3 text-base text-[hsl(var(--mkt-azahar)/0.8)]">{t("article.cta_body")}</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-6 bg-surface text-[hsl(var(--mkt-noche))] hover:bg-mkt-azahar focus-visible:ring-[hsl(var(--mkt-mediterraneo))]"
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
