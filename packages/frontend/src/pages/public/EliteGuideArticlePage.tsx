import { useEffect, useState, useCallback } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, GraduationCap, BookOpen, MapPin, Compass, Tent, Lightbulb, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { GUIDE_ARTICLES, type GuideRubric } from "@/content/elite-guide";

const RUBRIC_ICONS: Record<GuideRubric, React.ElementType> = {
  study: GraduationCap,
  learn: BookOpen,
  live: MapPin,
  experience: Compass,
  camps: Tent,
  insights: Lightbulb,
};

// Vite raw import glob for all SR articles
const srModules = import.meta.glob(
  "../../content/elite-guide/sr/*.md",
  { query: "?raw", import: "default" },
);

async function loadArticle(slug: string): Promise<string | null> {
  const key = `../../content/elite-guide/sr/${slug}.md`;
  const loader = srModules[key];
  if (!loader) return null;
  return (await loader()) as string;
}

function estimateReadingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

// Minimal markdown renderer for our prose subset
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) parts.push(<strong key={match.index} className="font-semibold text-ink">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
    else if (match[4] && match[5]) {
      const href = match[5];
      const isInternal = href.startsWith("/");
      if (isInternal) {
        parts.push(<Link key={match.index} to={href} className="text-brand underline decoration-brand/40 hover:decoration-brand">{match[4]}</Link>);
      } else {
        parts.push(<a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline decoration-brand/40 hover:decoration-brand">{match[4]}</a>);
      }
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownRenderer({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="prose-elite">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading levels — downshifted one level since page <h1> is the article title
        const h1 = trimmed.match(/^# (.+)/);
        const h2 = trimmed.match(/^## (.+)/);
        const h3 = trimmed.match(/^### (.+)/);
        if (h1) return <h2 key={i} className="font-display text-xl font-semibold text-ink sm:text-2xl mb-4 mt-8 first:mt-0">{renderInline(h1[1])}</h2>;
        if (h2) return <h3 key={i} className="font-display text-lg font-semibold text-ink mb-3 mt-6">{renderInline(h2[1])}</h3>;
        if (h3) return <h4 key={i} className="font-sans text-base font-semibold text-ink mb-3 mt-6">{renderInline(h3[1])}</h4>;

        // Horizontal rule
        if (trimmed === "---") return <hr key={i} className="my-8 border-line" />;

        // Unordered list
        const listLines = trimmed.split("\n").filter((l) => l.match(/^[-*] /));
        if (listLines.length > 0 && listLines.length === trimmed.split("\n").length) {
          return (
            <ul key={i} className="my-4 space-y-1.5 pl-5">
              {listLines.map((line, j) => (
                <li key={j} className="list-disc text-base leading-relaxed text-ink-secondary marker:text-accent">
                  {renderInline(line.replace(/^[-*] /, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Paragraph
        return (
          <p key={i} className="mb-5 text-base leading-relaxed text-ink-secondary">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function FadeUp({ children, className }: { children: React.ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function EliteGuideArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation("elite-guide");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const article = GUIDE_ARTICLES.find((a) => a.slug === slug);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const text = await loadArticle(slug);
    setContent(text);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (!article) return <Navigate to="/elite-guide" replace />;

  const Icon = RUBRIC_ICONS[article.rubric];
  const isEnglishOrSpanish = i18n.language === "en" || i18n.language === "es";
  const relatedArticles = article.related
    .map((r) => GUIDE_ARTICLES.find((a) => a.slug === r))
    .filter(Boolean) as typeof GUIDE_ARTICLES;

  return (
    <main>
      {/* Breadcrumb */}
      <nav aria-label={t("article.breadcrumb_guide")} className="bg-surface border-b border-line">
        <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-caption text-ink-tertiary flex-wrap">
            <li><Link to="/" className="hover:text-ink transition-colors">{t("article.breadcrumb_home")}</Link></li>
            <li aria-hidden="true" className="select-none">›</li>
            <li><Link to="/elite-guide" className="hover:text-ink transition-colors">{t("article.breadcrumb_guide")}</Link></li>
            <li aria-hidden="true" className="select-none">›</li>
            <li className="text-ink truncate max-w-xs">{t(article.titleKey)}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      {article.heroImage && (
        <div className="relative h-56 sm:h-72 overflow-hidden bg-surface">
          <img
            src={article.heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-canvas/90" aria-hidden="true" />
        </div>
      )}

      {/* Article header */}
      <section className="bg-canvas pt-10 pb-0">
        <FadeUp className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Icon className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t(`hub.rubric_${article.rubric}`)}
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl lg:text-4xl">
            {t(article.titleKey)}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-secondary max-w-prose">
            {t(article.excerptKey)}
          </p>
          {content && (
            <div className="mt-3 flex items-center gap-1.5 text-caption text-ink-tertiary">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("article.reading_time", { minutes: estimateReadingTime(content) })}</span>
            </div>
          )}
        </FadeUp>
      </section>

      {/* Article body */}
      <section className="bg-canvas py-10">
        <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8">
          {/* Language fallback notice */}
          {isEnglishOrSpanish && (
            <div className="mb-8 rounded-ui-md border border-line bg-surface px-4 py-3 text-small text-ink-secondary">
              {t("article.fallback_lang_note")}
            </div>
          )}

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-4 rounded-ui-sm bg-surface ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
              ))}
            </div>
          ) : content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-ink-secondary">{t("hub.articles_empty")}</p>
          )}
        </div>
      </section>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-surface border-t border-line py-12">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-6">
              {t("article.related_label")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedArticles.map((rel) => {
                const RelIcon = RUBRIC_ICONS[rel.rubric];
                return (
                  <Link
                    key={rel.slug}
                    to={`/elite-guide/${rel.slug}`}
                    className="group flex items-start gap-3 rounded-ui-md border border-line bg-canvas p-4 hover:shadow-ui-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                  >
                    <RelIcon className="h-4 w-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-small font-semibold text-ink group-hover:text-brand transition-colors leading-snug">
                        {t(rel.titleKey)}
                      </p>
                      <p className="mt-1 text-caption text-ink-tertiary line-clamp-2">{t(rel.excerptKey)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-brand py-16">
        <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-brand-contrast sm:text-3xl">
            {t("article.cta_label")}
          </h2>
          <p className="mt-3 text-base text-brand-contrast/80">{t("article.cta_body")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              className="bg-surface text-brand hover:bg-canvas focus-visible:ring-accent"
              asChild
            >
              <Link to="/contact">
                {t("article.cta_button")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="border border-brand-contrast/50 text-brand-contrast hover:border-brand-contrast hover:bg-brand-contrast/10" asChild>
              <Link to="/elite-guide">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("article.back_to_guide")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
