import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MeshGradientBackground } from "@/components/marketing/MeshGradientBackground";
import { AuroraSection } from "@/components/marketing/AuroraSection";
import { GlassCard } from "@/components/marketing/GlassCard";
import { BentoCell } from "@/components/marketing/BentoCell";
import {
  SolRule,
  VibrantSectionLabel,
  MarketingPageHeader,
  VibrantFadeUp,
} from "@/components/marketing/vibrant-helpers";

type ServiceKey = "s01" | "s02" | "s03" | "s04";

const SERVICE_CARDS: Array<{
  key: ServiceKey;
  eager: boolean;
}> = [
  { key: "s02", eager: true },
  { key: "s01", eager: true },
  { key: "s03", eager: false },
  { key: "s04", eager: false },
];

type RegularTone = "noche" | "mediterraneo" | "fiesta";
const REGULAR_TONES: RegularTone[] = ["noche", "mediterraneo", "fiesta"];

/* ── Service card body — shared between featured and regular cells ── */
interface ServiceCardBodyProps {
  cardKey: ServiceKey;
  featured?: boolean;
}
function ServiceCardBody({ cardKey, featured = false }: ServiceCardBodyProps) {
  const { t } = useTranslation("home");
  const bullets = t(`services.${cardKey}_bullets`, { returnObjects: true }) as string[];

  return (
    <div className={featured ? "p-6 sm:p-8" : "p-5"}>
      {/* Number badge */}
      <span
        className="font-display text-3xl font-bold text-mkt-azahar/30"
        aria-hidden="true"
      >
        {t(`services.${cardKey}_number`)}
      </span>

      {/* Label eyebrow */}
      <VibrantSectionLabel tone="sol" className="mt-3">
        {t(`services.${cardKey}_label`)}
      </VibrantSectionLabel>

      {/* Title */}
      <h2
        className={`mt-2 font-display font-semibold text-mkt-azahar ${
          featured ? "text-2xl sm:text-3xl" : "text-xl"
        }`}
      >
        {t(`services.${cardKey}_title`)}
      </h2>

      {/* Body */}
      <p className="mt-3 text-sm leading-relaxed text-mkt-azahar/75">
        {t(`services.${cardKey}_body`)}
      </p>

      {/* Bullets */}
      {Array.isArray(bullets) && bullets.length > 0 && (
        <ul
          className={`mt-4 gap-1.5 ${
            featured
              ? "grid grid-cols-1 sm:grid-cols-2 space-y-0"
              : "flex flex-col space-y-1.5"
          }`}
          aria-label={t(`services.${cardKey}_label`)}
        >
          {bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-2 text-sm text-mkt-azahar/70"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-mkt-sol"
                aria-hidden
              />
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {/* Tagline */}
      <p className="mt-5 border-t border-mkt-azahar/15 pt-4 text-sm italic text-mkt-azahar/60">
        {t(`services.${cardKey}_tagline`)}
      </p>

      {/* CTA */}
      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="border border-mkt-azahar/30 text-mkt-azahar hover:border-mkt-azahar/60 hover:bg-mkt-azahar/10"
          asChild
        >
          <Link to="/contact">
            {t(`services.${cardKey}_cta`)}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ── ServicesPage ─────────────────────────────────────────────────── */
export function ServicesPage() {
  const { t } = useTranslation("home");

  const [featuredCard, ...regularCards] = SERVICE_CARDS;

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <MeshGradientBackground
        variant="noche"
        as="section"
        className="py-20 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <MarketingPageHeader
            eyebrow={t("services.label")}
            title={t("services.title")}
            deck={t("services.subtitle")}
            tone="dark"
          />
        </div>
      </MeshGradientBackground>

      {/* ── Services Bento Grid ─────────────────────────────────── */}
      <section className="bg-canvas py-20 sm:py-28">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* Featured service — spans full width at md+ */}
            <VibrantFadeUp
              delay={0}
              className="col-span-1 md:col-span-2 lg:col-span-3"
            >
              <AuroraSection
                as="div"
                className="mkt-mesh-noche rounded-2xl"
                scrim="dark"
              >
                <GlassCard interactive tone="dark">
                  <ServiceCardBody cardKey={featuredCard.key} featured />
                </GlassCard>
              </AuroraSection>
            </VibrantFadeUp>

            {/* Regular service cells */}
            {regularCards.map((card, i) => {
              const tone = REGULAR_TONES[i % REGULAR_TONES.length];
              /* Last card spans full width on md to avoid orphan */
              const isLast = i === regularCards.length - 1;
              return (
                <VibrantFadeUp
                  key={card.key}
                  delay={(i + 1) * 0.1}
                  className={isLast ? "col-span-1 md:col-span-2 lg:col-span-1" : "col-span-1"}
                >
                  <BentoCell tone={tone} className="h-full p-0">
                    <GlassCard interactive tone="dark" className="h-full">
                      <ServiceCardBody cardKey={card.key} />
                    </GlassCard>
                  </BentoCell>
                </VibrantFadeUp>
              );
            })}
          </div>

          {/* Divider */}
          <SolRule className="my-12" />

          {/* ── CTA Section ─────────────────────────────────────── */}
          <VibrantFadeUp delay={0.3}>
            <MeshGradientBackground
              variant="mediterraneo"
              className="rounded-2xl px-8 py-12 sm:px-12 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <VibrantSectionLabel tone="sol">
                  {t("cta.label")}
                </VibrantSectionLabel>
                <h2 className="font-display text-2xl font-semibold text-mkt-azahar sm:text-3xl">
                  {t("cta.title")}
                </h2>
                <SolRule className="w-24" />
                <p className="max-w-xl text-base leading-relaxed text-mkt-azahar/80">
                  {t("cta.body")}
                </p>
                <div className="mt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-mkt-azahar text-mkt-noche hover:bg-mkt-azahar/90"
                    asChild
                  >
                    <Link to="/contact">
                      {t("cta.button")}
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </MeshGradientBackground>
          </VibrantFadeUp>
        </div>
      </section>
    </div>
  );
}
