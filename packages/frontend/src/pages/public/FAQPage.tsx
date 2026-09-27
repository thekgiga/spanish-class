import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  GoldRule,
  SectionLabel,
  PageHeader,
} from "@/components/shared/editorial-helpers";

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
        <span className="text-sm font-semibold text-ink sm:text-base">{question}</span>
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

const FAQ_ITEMS = ["q1", "q2", "q3", "q4", "q5"] as const;

export function FAQPage() {
  const { t } = useTranslation("home");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <PageHeader
        label={t("faq.label")}
        title={t("faq.title")}
        subtitle={t("faq.subtitle")}
      />

      <section className="bg-canvas py-20 sm:py-28">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-3">
            <FadeUp className="lg:col-span-1">
              <SectionLabel>{t("faq.label")}</SectionLabel>
              <GoldRule className="mb-6" />
              <p className="text-base leading-relaxed text-ink-secondary">
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
    </div>
  );
}
