import { motion } from 'framer-motion';
import { GraduationCap, Heart, Globe2, Award, Instagram } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Heart,
    title: 'Passion for Teaching',
    description:
      'We believe in making learning enjoyable. Our sessions are designed to be engaging and interactive.',
  },
  {
    icon: Globe2,
    title: 'Cultural Immersion',
    description:
      'Language is more than words. We teach you the culture, idioms, and real-world usage.',
  },
  {
    icon: GraduationCap,
    title: 'Personalized Learning',
    description:
      'Every student is unique. We adapt our teaching methods to fit your learning style and goals.',
  },
  {
    icon: Award,
    title: 'Quality Education',
    description:
      'All our instructors are certified native speakers with years of teaching experience.',
  },
];

export function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold">About Us</h1>
            <p className="mt-6 text-xl text-slate-300">
              We're passionate about helping people master Spanish through personalized,
              engaging online lessons.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  Spanish Class was founded with a simple mission: to make high-quality
                  Spanish education accessible to everyone, regardless of their location.
                </p>
                <p>
                  As a native Spanish speaker from Madrid with over a decade of teaching
                  experience, I've seen firsthand how traditional language learning methods
                  often fall short. Students memorize grammar rules and vocabulary lists but
                  struggle to hold real conversations.
                </p>
                <p>
                  That's why I created this platform - to focus on what really matters:
                  conversation, cultural understanding, and practical communication skills
                  that you can use in real life.
                </p>
                <p>
                  Whether you're learning Spanish for travel, work, or personal enrichment,
                  I'm here to guide you on your journey to fluency.
                </p>
              </div>
              <div className="mt-8">
                <a
                  href="https://www.instagram.com/casovi_spanskog_online/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="group">
                    <Instagram className="mr-2 h-5 w-5 group-hover:text-pink-600 transition-colors" />
                    Follow on Instagram
                  </Button>
                </a>
                <p className="mt-3 text-sm text-slate-600">
                  Connect with me on Instagram for daily Spanish tips, cultural insights, and student success stories
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                alt="Spanish teacher"
                className="rounded-2xl shadow-large"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              These principles guide everything we do.
            </p>
          </motion.div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardContent className="pt-8 pb-6">
                    <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                      <value.icon className="h-7 w-7 text-indigo-600" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-slate-900">{value.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"
                alt="Teaching Spanish"
                className="rounded-2xl shadow-large"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                Qualifications & Experience
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-slate-700">Native Speaker:</strong> Born and raised
                  in Madrid, Spain with perfect fluency in both Spanish and English.
                </p>
                <p>
                  <strong className="text-slate-700">Certified Teacher:</strong> ELE
                  (Spanish as a Foreign Language) certification from Instituto Cervantes.
                </p>
                <p>
                  <strong className="text-slate-700">Experience:</strong> 10+ years teaching
                  Spanish to students from over 30 countries.
                </p>
                <p>
                  <strong className="text-slate-700">Specializations:</strong> Business
                  Spanish, DELE exam preparation, conversational fluency, and cultural
                  immersion.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
