import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Video,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  Award,
  MessageCircle,
  BookOpen,
  Target,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "@/components/ui/premium";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const featuresConfig = [
  {
    icon: Video,
    titleKey: "features.video_title",
    descriptionKey: "features.video_description",
    color: "from-spanish-teal-500 to-spanish-teal-600",
    bg: "bg-spanish-teal-50",
  },
  {
    icon: Calendar,
    titleKey: "features.calendar_title",
    descriptionKey: "features.calendar_description",
    color: "from-spanish-coral-500 to-spanish-coral-600",
    bg: "bg-spanish-coral-50",
  },
  {
    icon: Users,
    titleKey: "features.users_title",
    descriptionKey: "features.users_description",
    color: "from-spanish-sunshine-500 to-spanish-sunshine-600",
    bg: "bg-spanish-sunshine-50",
  },
  {
    icon: Globe,
    titleKey: "features.globe_title",
    descriptionKey: "features.globe_description",
    color: "from-spanish-orange-500 to-spanish-orange-600",
    bg: "bg-spanish-orange-50",
  },
];

const statsConfig = [
  {
    valueKey: "stats.students_value",
    labelKey: "stats.students_label",
    icon: Users,
    color: "spanish-teal",
  },
  {
    valueKey: "stats.countries_value",
    labelKey: "stats.countries_label",
    icon: Globe,
    color: "spanish-coral",
  },
  {
    valueKey: "stats.sessions_value",
    labelKey: "stats.sessions_label",
    icon: Video,
    color: "spanish-sunshine",
  },
  {
    valueKey: "stats.rating_value",
    labelKey: "stats.rating_label",
    icon: Star,
    color: "spanish-orange",
  },
];

const benefitsConfig = [
  {
    icon: Award,
    titleKey: "benefits.dele_title",
    descriptionKey: "benefits.dele_description",
    color: "from-spanish-teal-500 to-spanish-teal-600",
  },
  {
    icon: BookOpen,
    titleKey: "benefits.university_title",
    descriptionKey: "benefits.university_description",
    color: "from-spanish-coral-500 to-spanish-coral-600",
  },
  {
    icon: MessageCircle,
    titleKey: "benefits.conversation_title",
    descriptionKey: "benefits.conversation_description",
    color: "from-spanish-sunshine-500 to-spanish-sunshine-600",
  },
  {
    icon: Target,
    titleKey: "benefits.personalized_title",
    descriptionKey: "benefits.personalized_description",
    color: "from-spanish-orange-500 to-spanish-orange-600",
  },
];

const testimonialsConfig = [
  {
    nameKey: "testimonials.sarah_name",
    roleKey: "testimonials.sarah_role",
    contentKey: "testimonials.sarah_content",
    rating: 5,
    image: "SM",
    color: "from-spanish-teal-500 to-spanish-teal-600",
  },
  {
    nameKey: "testimonials.james_name",
    roleKey: "testimonials.james_role",
    contentKey: "testimonials.james_content",
    rating: 5,
    image: "JL",
    color: "from-spanish-coral-500 to-spanish-coral-600",
  },
  {
    nameKey: "testimonials.emily_name",
    roleKey: "testimonials.emily_role",
    contentKey: "testimonials.emily_content",
    rating: 5,
    image: "ER",
    color: "from-spanish-sunshine-500 to-spanish-sunshine-600",
  },
];

export function HomePage() {
  const { t } = useTranslation("home");

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Bright & Colorful */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-spanish-teal-50 via-white to-spanish-coral-50">
        {/* Decorative colorful blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-teal-400 to-spanish-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-coral-400 to-spanish-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-spanish-sunshine-300 to-spanish-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-4000" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Main heading */}
              <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-900">
                {t("hero.title_line1")}
                <br />
                {t("hero.title_line2")}
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-xl leading-relaxed text-slate-700 max-w-xl mx-auto lg:mx-0">
                {t("hero.subtitle")}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                <PrimaryButton
                  size="lg"
                  className="text-xl px-12 py-6 bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 hover:from-spanish-coral-600 hover:to-spanish-orange-600 shadow-2xl hover:shadow-spanish-coral-500/50 transform hover:scale-105 transition-all duration-300 ring-4 ring-spanish-coral-200"
                  asChild
                >
                  <Link to="/auth">
                    <Sparkles className="h-6 w-6" />
                    {t("hero.cta_primary")}
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </PrimaryButton>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br",
                          i === 1 &&
                            "from-spanish-teal-500 to-spanish-teal-600",
                          i === 2 &&
                            "from-spanish-coral-500 to-spanish-coral-600",
                          i === 3 &&
                            "from-spanish-sunshine-500 to-spanish-sunshine-600",
                          i === 4 &&
                            "from-spanish-orange-500 to-spanish-orange-600",
                        )}
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="font-semibold">
                    {t("stats.students_value")} {t("hero.trust_students")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-spanish-sunshine-500 text-spanish-sunshine-500"
                    />
                  ))}
                  <span className="ml-2 font-semibold">
                    {t("stats.rating_value")} {t("hero.trust_rating")}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right - Colorful Bento Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Large card */}
              <div className="col-span-2 bg-white rounded-3xl p-8 shadow-2xl border-2 border-spanish-teal-200 hover:border-spanish-teal-400 transition-all duration-300 hover:shadow-spanish-teal-500/20">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 mb-4 shadow-lg">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">
                  {t("hero_cards.video_title")}
                </h3>
                <p className="text-slate-600">
                  {t("hero_cards.video_description")}
                </p>
              </div>

              {/* Stats cards */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-spanish-coral-200 hover:border-spanish-coral-400 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-spanish-coral-500 to-spanish-coral-600 mb-3 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {t("stats.students_value")}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {t("hero_cards.students_label")}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-spanish-sunshine-200 hover:border-spanish-sunshine-400 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-spanish-sunshine-500 to-spanish-sunshine-600 mb-3 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {t("stats.rating_value")}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {t("hero_cards.rating_label")}
                </div>
              </div>

              {/* Feature card */}
              <div className="col-span-2 bg-white rounded-2xl p-6 shadow-xl border-2 border-spanish-orange-200 hover:border-spanish-orange-400 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-spanish-orange-500 to-spanish-orange-600 flex items-center justify-center shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-900">
                    {t("hero_cards.scheduling_title")}
                  </h4>
                </div>
                <p className="text-sm text-slate-600">
                  {t("hero_cards.scheduling_description")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-white border-y-4 border-spanish-teal-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsConfig.map((stat, index) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br mb-4 shadow-lg",
                    stat.color === "spanish-teal" &&
                      "from-spanish-teal-500 to-spanish-teal-600",
                    stat.color === "spanish-coral" &&
                      "from-spanish-coral-500 to-spanish-coral-600",
                    stat.color === "spanish-sunshine" &&
                      "from-spanish-sunshine-500 to-spanish-sunshine-600",
                    stat.color === "spanish-orange" &&
                      "from-spanish-orange-500 to-spanish-orange-600",
                  )}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  {t(stat.valueKey)}
                </div>
                <div className="text-sm text-slate-600 font-semibold">
                  {t(stat.labelKey)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-gradient-to-br from-spanish-teal-50/50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-spanish-teal-100 text-spanish-teal-700 border-spanish-teal-200 px-6 py-2 text-base font-semibold">
              {t("features.badge")}
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 sm:text-5xl">
              {t("features.title")}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuresConfig.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2",
                  feature.bg,
                  "border-transparent hover:scale-105 cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br mb-4 shadow-lg",
                    feature.color,
                  )}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-spanish-coral-200">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt={t("benefits.image_alt")}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl border-2 border-spanish-teal-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      100%
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">
                      {t("benefits.satisfaction")}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-spanish-teal-100 text-spanish-teal-700 border-spanish-teal-200 px-6 py-2 text-base font-semibold">
                {t("benefits.badge")}
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 sm:text-5xl">
                {t("benefits.title")}
              </h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                {t("benefits.subtitle")}
              </p>

              <div className="grid gap-6">
                {benefitsConfig.map((benefit, index) => (
                  <motion.div
                    key={benefit.titleKey}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-spanish-teal-100 hover:border-spanish-teal-300"
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
                        benefit.color,
                      )}
                    >
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">
                        {t(benefit.titleKey)}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {t(benefit.descriptionKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <PrimaryButton size="lg" className="mt-10" asChild>
                <Link to="/auth">
                  <Sparkles className="h-5 w-5" />
                  {t("benefits.cta")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </PrimaryButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-gradient-to-br from-spanish-coral-50/50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-spanish-teal-100 text-spanish-teal-700 border-spanish-teal-200 px-6 py-2 text-base font-semibold">
              {t("testimonials.badge")}
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 sm:text-5xl">
              {t("testimonials.title")}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t("testimonials.subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialsConfig.map((testimonial, index) => (
              <motion.div
                key={testimonial.nameKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-spanish-coral-100 hover:border-spanish-coral-300"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-spanish-sunshine-500 text-spanish-sunshine-500"
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  "{t(testimonial.contentKey)}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br",
                      testimonial.color,
                    )}
                  >
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {t(testimonial.nameKey)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {t(testimonial.roleKey)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-gradient-to-r from-spanish-teal-500 via-spanish-coral-500 to-spanish-orange-500 text-white relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 sm:text-5xl lg:text-6xl">
              {t("cta.title")}
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-90">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                size="lg"
                className="text-xl px-12 py-6 bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 hover:from-spanish-coral-600 hover:to-spanish-orange-600 shadow-2xl hover:shadow-spanish-coral-500/50 transform hover:scale-105 transition-all duration-300 ring-4 ring-spanish-coral-200"
                asChild
              >
                <Link to="/auth">
                  <Sparkles className="h-6 w-6" />
                  {t("cta.button_primary")}
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </PrimaryButton>
              <PrimaryButton
                size="lg"
                className="text-lg px-10 py-4 bg-white/20 text-white backdrop-blur-sm border-2 border-white hover:bg-white/30 shadow-xl"
                asChild
              >
                <Link to="/contact">{t("cta.button_secondary")}</Link>
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
