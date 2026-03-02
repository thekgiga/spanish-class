import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Award,
  Globe,
  Heart,
  Target,
  Users,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOMeta } from "@/components/shared/SEOMeta";
import { PrimaryButton } from "@/components/ui/premium";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const valuesConfig = [
  {
    icon: Heart,
    titleKey: "values.passion_title",
    descriptionKey: "values.passion_description",
    color: "from-spanish-coral-500 to-spanish-coral-600",
  },
  {
    icon: Target,
    titleKey: "values.personalized_title",
    descriptionKey: "values.personalized_description",
    color: "from-spanish-teal-500 to-spanish-teal-600",
  },
  {
    icon: Users,
    titleKey: "values.community_title",
    descriptionKey: "values.community_description",
    color: "from-spanish-sunshine-500 to-spanish-sunshine-600",
  },
  {
    icon: Globe,
    titleKey: "values.cultural_title",
    descriptionKey: "values.cultural_description",
    color: "from-spanish-orange-500 to-spanish-orange-600",
  },
];

const milestonesConfig = [
  {
    year: "2020",
    titleKey: "timeline.2020_title",
    descriptionKey: "timeline.2020_description",
    color: "from-spanish-teal-500 to-spanish-teal-600",
  },
  {
    year: "2021",
    titleKey: "timeline.2021_title",
    descriptionKey: "timeline.2021_description",
    color: "from-spanish-coral-500 to-spanish-coral-600",
  },
  {
    year: "2023",
    titleKey: "timeline.2023_title",
    descriptionKey: "timeline.2023_description",
    color: "from-spanish-sunshine-500 to-spanish-sunshine-600",
  },
  {
    year: "2026",
    titleKey: "timeline.2026_title",
    descriptionKey: "timeline.2026_description",
    color: "from-spanish-orange-500 to-spanish-orange-600",
  },
];

export function AboutPage() {
  const { t } = useTranslation("about");

  return (
    <>
      <SEOMeta
        title={t("page.seo_title")}
        description={t("page.seo_description")}
        canonical="/about"
        keywords={[
          "about spanish class",
          "spanish language learning",
          "learn spanish online",
          "spanish teachers",
          "DELE certification",
          "language learning platform",
          "spanish culture",
        ]}
        image="/images/og/about.jpg"
        type="website"
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-spanish-teal-50 via-white to-spanish-coral-50">
          {/* Decorative colorful blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-teal-400 to-spanish-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-coral-400 to-spanish-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-spanish-sunshine-300 to-spanish-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-4000" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-spanish-teal-100 text-spanish-teal-700 border-spanish-teal-200 px-6 py-2 text-sm font-semibold">
                <Heart className="h-4 w-4 mr-2" />
                {t("page.badge")}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
                {t("page.title")}
              </h1>
              <p className="text-xl text-slate-700 leading-relaxed">
                {t("page.subtitle")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                    {t("mission.title")}
                  </h2>
                </div>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  {t("mission.paragraph1")}
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {t("mission.paragraph2")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-spanish-teal-200 hover:border-spanish-teal-400 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-spanish-coral-500 to-spanish-coral-600 mb-6 shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  {t("mission.why_choose_title")}
                </h3>
                <ul className="space-y-4">
                  {[
                    t("mission.reason_1"),
                    t("mission.reason_2"),
                    t("mission.reason_3"),
                    t("mission.reason_4"),
                    t("mission.reason_5"),
                  ].map((item, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="w-2 h-2 bg-spanish-teal-500 rounded-full mt-2 shrink-0" />
                      <p className="text-slate-600">{item}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-br from-spanish-coral-50/50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-spanish-teal-100 text-spanish-teal-700 border-spanish-teal-200 px-6 py-2 text-base font-semibold">
                {t("values.badge")}
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                {t("values.title")}
              </h2>
              <p className="text-lg text-slate-600">{t("values.subtitle")}</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {valuesConfig.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-spanish-teal-100 hover:border-spanish-teal-300"
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-4",
                        value.color,
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {t(value.titleKey)}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {t(value.descriptionKey)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-spanish-teal-100 text-spanish-teal-700 border-spanish-teal-200 px-6 py-2 text-base font-semibold">
                {t("timeline.badge")}
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                {t("timeline.title")}
              </h2>
              <p className="text-lg text-slate-600">{t("timeline.subtitle")}</p>
            </motion.div>

            <div className="space-y-12">
              {milestonesConfig.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className="flex gap-8 items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="shrink-0">
                    <div
                      className={cn(
                        "w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-2xl",
                        milestone.color,
                      )}
                    >
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {t(milestone.titleKey)}
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {t(milestone.descriptionKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-spanish-teal-500 via-spanish-coral-500 to-spanish-orange-500 text-white relative overflow-hidden">
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 sm:text-5xl">
                {t("cta.title")}
              </h2>
              <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-90">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PrimaryButton size="lg" className="text-lg px-10" asChild>
                  <Link to="/auth">
                    <Sparkles className="h-5 w-5" />
                    {t("cta.button_primary")}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </PrimaryButton>
                <button className="px-10 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm border-2 border-white rounded-xl hover:bg-white/30 transition-all duration-200 shadow-xl">
                  {t("cta.button_secondary")}
                </button>
              </div>
              <p className="mt-8 text-sm opacity-75">{t("cta.features")}</p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
