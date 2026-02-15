import { motion } from "framer-motion";
import { Award, Globe, Heart, Target, Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOMeta } from "@/components/shared/SEOMeta";

const values = [
  {
    icon: Heart,
    title: "Passion for Teaching",
    description:
      "We love helping students discover the beauty of the Spanish language and Hispanic culture.",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description:
      "Every student has unique goals. We create customized learning plans tailored to your needs.",
  },
  {
    icon: Users,
    title: "Community Focus",
    description:
      "Learning is better together. Join a supportive community of Spanish language enthusiasts.",
  },
  {
    icon: Globe,
    title: "Cultural Immersion",
    description:
      "Experience authentic Spanish culture through language, not just grammar and vocabulary.",
  },
];

const milestones = [
  {
    year: "2020",
    title: "Founded",
    description:
      "Started with a vision to make Spanish learning accessible and engaging online.",
  },
  {
    year: "2021",
    title: "100 Students",
    description:
      "Reached our first major milestone with students from 15 different countries.",
  },
  {
    year: "2023",
    title: "DELE Certified",
    description: "Became an authorized DELE exam preparation center.",
  },
  {
    year: "2026",
    title: "Premium Platform",
    description:
      "Launched our modern booking platform for seamless class scheduling.",
  },
];

export function AboutPage() {
  return (
    <>
      <SEOMeta
        title="About Us - Premium Spanish Learning Platform"
        description="Learn about Spanish Class, our mission to make Spanish language learning accessible, engaging, and culturally immersive. Certified teachers, personalized learning plans, and a supportive community of language enthusiasts."
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

      <div className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-spanish-red-50 via-white to-gold-50 py-20 sm:py-28">
          <div className="absolute inset-0 bg-[url('/src/assets/patterns/moorish-hexagon.svg')] opacity-[0.03]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-clay-900 mb-6">
                Our{" "}
                <span className="bg-gradient-to-r from-spanish-red-600 to-gold-600 bg-clip-text text-transparent">
                  Story
                </span>
              </h1>
              <p className="text-xl text-clay-600 leading-relaxed">
                We believe that learning Spanish should be more than memorizing
                grammar rules. It's about discovering a new culture, connecting
                with millions of speakers worldwide, and opening doors to
                incredible opportunities.
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
                  <BookOpen className="w-8 h-8 text-spanish-red-600" />
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-clay-900">
                    Our Mission
                  </h2>
                </div>
                <p className="text-lg text-clay-600 leading-relaxed mb-6">
                  At Spanish Class, our mission is to make Spanish language
                  learning accessible, engaging, and culturally immersive for
                  students worldwide. We combine expert teaching with modern
                  technology to create a premium learning experience that fits
                  your lifestyle.
                </p>
                <p className="text-lg text-clay-600 leading-relaxed">
                  Whether you're preparing for DELE exams, planning to study
                  abroad, or simply passionate about Hispanic culture, we're
                  here to guide you every step of the way.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-spanish-red-200 to-gold-200 rounded-2xl blur-3xl opacity-20" />
                <Card className="relative bg-white/80 backdrop-blur-sm border-2 border-spanish-red-100">
                  <CardHeader>
                    <Award className="w-12 h-12 text-gold-600 mb-4" />
                    <CardTitle className="text-2xl font-serif">
                      Why Choose Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="w-2 h-2 bg-spanish-red-600 rounded-full mt-2 shrink-0" />
                        <p className="text-clay-600">
                          Certified teachers with years of experience
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-2 h-2 bg-spanish-red-600 rounded-full mt-2 shrink-0" />
                        <p className="text-clay-600">
                          Personalized learning plans for every student
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-2 h-2 bg-spanish-red-600 rounded-full mt-2 shrink-0" />
                        <p className="text-clay-600">
                          Flexible scheduling that fits your lifestyle
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-2 h-2 bg-spanish-red-600 rounded-full mt-2 shrink-0" />
                        <p className="text-clay-600">
                          Cultural immersion beyond language learning
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-2 h-2 bg-spanish-red-600 rounded-full mt-2 shrink-0" />
                        <p className="text-clay-600">
                          Modern platform for seamless booking experience
                        </p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 sm:py-28 bg-clay-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-clay-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-clay-600">
                These principles guide everything we do at Spanish Class
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="pt-6">
                        <Icon className="w-12 h-12 text-spanish-red-600 mb-4" />
                        <h3 className="text-xl font-semibold text-clay-900 mb-3">
                          {value.title}
                        </h3>
                        <p className="text-clay-600 leading-relaxed">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
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
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-clay-900 mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-clay-600">
                Growing and evolving to serve you better
              </p>
            </motion.div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className="flex gap-8 items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-spanish-red-500 to-gold-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-serif font-bold text-clay-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-lg text-clay-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-br from-spanish-red-600 to-gold-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/src/assets/patterns/moorish-hexagon.svg')] opacity-[0.1]" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
                Ready to Start Your Spanish Journey?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join our community of passionate learners and experience the
                difference of personalized, culturally-immersive Spanish
                education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-spanish-red-600 rounded-lg font-semibold hover:bg-clay-50 transition-colors duration-200"
                >
                  Get Started Today
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 bg-spanish-red-700/50 backdrop-blur-sm border-2 border-white/20 text-white rounded-lg font-semibold hover:bg-spanish-red-700/70 transition-colors duration-200"
                >
                  View Pricing
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
