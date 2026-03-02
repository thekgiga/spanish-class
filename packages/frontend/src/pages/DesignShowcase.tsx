/**
 * PREMIUM DESIGN SHOWCASE
 * Demonstrates the cutting-edge liquid glass luxury aesthetic
 */

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Video,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  GlassCard,
  GoldButton,
  PremiumStat,
  MorphingShape,
  FloatingElement,
  PremiumProgress,
  StreakCounter,
} from "@/components/ui/premium";

export function DesignShowcase() {
  const { t } = useTranslation("showcase");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark">
      {/* HERO SECTION - Full screen with video background effect */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Animated background shapes */}
        <MorphingShape
          color="gold"
          className="top-0 right-0 h-[600px] w-[600px]"
        />
        <MorphingShape
          color="purple"
          className="bottom-0 left-0 h-[500px] w-[500px]"
        />
        <MorphingShape
          color="cyan"
          className="top-1/2 left-1/2 h-[400px] w-[400px]"
        />

        {/* Lighter overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/60 to-slate-900" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-luxury-gold-400/30 bg-luxury-gold-400/10 px-6 py-2 backdrop-blur-xl"
            >
              <Sparkles className="h-4 w-4 text-luxury-gold-400" />
              <span className="text-sm font-semibold text-luxury-gold-400">
                {t("badge")}
              </span>
            </motion.div>

            {/* Main heading with chromatic aberration */}
            <h1 className="mb-8 font-display text-6xl font-bold leading-tight text-white sm:text-7xl lg:text-8xl">
              {t("title_part1")}
              <br />
              <span className="text-gradient-gold">{t("title_part2")}</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-white/80 sm:text-2xl">
              {t("subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <GoldButton size="xl">
                <span className="flex items-center gap-2">
                  Start Free Trial
                  <Video className="h-5 w-5" />
                </span>
              </GoldButton>

              <button className="group glass-card-light px-8 py-4 text-lg font-semibold text-white">
                <span className="flex items-center gap-2">
                  View Demo
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </button>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/60"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-obsidian bg-gradient-to-br from-luxury-gold-400 to-luxury-gold-600"
                    />
                  ))}
                </div>
                <span className="font-medium">500+ Students</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl">⭐⭐⭐⭐⭐</span>
                <span className="font-medium">4.9 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <span className="font-medium">50+ Countries</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating premium card */}
          <FloatingElement delay={0.5} className="mt-20">
            <GlassCard className="mx-auto max-w-md p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-luxury-purple-500 to-luxury-purple-600 shadow-purple-glow">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">
                    Live Session Starting
                  </p>
                  <p className="text-sm text-white/60">Join in 5 minutes</p>
                </div>
                <GoldButton size="sm" className="ml-auto">
                  Join →
                </GoldButton>
              </div>
            </GlassCard>
          </FloatingElement>
        </div>
      </section>

      {/* PREMIUM STATS SECTION */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-display text-4xl font-bold text-white sm:text-5xl">
              Premium Dashboard Preview
            </h2>
            <p className="text-xl text-white/60">
              Experience luxury in every interaction
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <PremiumStat
                value="24"
                label="Total Hours"
                icon={<Clock className="h-7 w-7 text-white" />}
                variant="gold"
                trend="up"
                trendValue="+12%"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <PremiumStat
                value="15"
                label="Classes Completed"
                icon={<BookOpen className="h-7 w-7 text-white" />}
                variant="purple"
                trend="up"
                trendValue="+3"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <PremiumStat
                value="8"
                label="Upcoming Sessions"
                icon={<Calendar className="h-7 w-7 text-white" />}
                variant="cyan"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <StreakCounter days={7} variant="fire" />
            </motion.div>
          </div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <GlassCard className="p-8">
              <h3 className="mb-6 text-2xl font-display font-bold text-white">
                Learning Progress
              </h3>
              <div className="space-y-6">
                <PremiumProgress
                  value={75}
                  label="Conversation Skills"
                  showPercentage
                />
                <PremiumProgress
                  value={60}
                  label="Grammar Mastery"
                  showPercentage
                />
                <PremiumProgress value={90} label="Vocabulary" showPercentage />
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-display text-4xl font-bold text-white sm:text-5xl">
              Premium Features
            </h2>
            <p className="text-xl text-white/60">
              Everything you need for language mastery
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Video,
                title: "HD Video Sessions",
                description:
                  "Crystal-clear video calls with professional teachers. Screen sharing, live captions, and recording available.",
                color: "purple" as const,
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description:
                  "Book sessions that fit your schedule. Real-time availability, instant confirmations, easy rescheduling.",
                color: "gold" as const,
              },
              {
                icon: Users,
                title: "Group & Private",
                description:
                  "Choose between intimate 1-on-1 sessions or engaging group classes with students at your level.",
                color: "cyan" as const,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <GlassCard className="group p-8 text-center">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-luxury-gold-400 to-luxury-gold-600 shadow-gold-glow">
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="mb-4 text-2xl font-display font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-white/70">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-32">
        <MorphingShape
          color="gold"
          className="top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 font-display text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              Ready to Experience
              <br />
              <span className="text-gradient-gold">Luxury Learning?</span>
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-white/80">
              Join the most premium Spanish learning platform. Start your free
              trial today.
            </p>
            <GoldButton size="xl">
              <span className="flex items-center gap-2 text-xl">
                Start Free Trial
                <TrendingUp className="h-6 w-6" />
              </span>
            </GoldButton>
            <p className="mt-6 text-sm text-white/50">
              No credit card required • Cancel anytime • Premium support
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
