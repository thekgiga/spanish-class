import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Video, Users, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Book classes that fit your schedule. Available slots updated in real-time.',
  },
  {
    icon: Video,
    title: 'Live Video Sessions',
    description: 'Face-to-face lessons via Google Meet with native Spanish speakers.',
  },
  {
    icon: Users,
    title: 'Individual & Group',
    description: 'Choose between private one-on-one sessions or interactive group classes.',
  },
];

const benefits = [
  'Native Spanish-speaking instructors',
  'Personalized learning plans',
  'Conversation-focused approach',
  'Cultural insights included',
  'Progress tracking',
  'Flexible cancellation policy',
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Business Professional',
    content:
      'The conversation practice sessions have been incredible for my work. I feel so much more confident speaking Spanish in meetings now.',
    rating: 5,
  },
  {
    name: 'James L.',
    role: 'Student',
    content:
      'Group classes are engaging and fun! Great way to practice with others at the same level.',
    rating: 5,
  },
  {
    name: 'Emily R.',
    role: 'Travel Enthusiast',
    content:
      'Flexible scheduling is a lifesaver. I can book sessions around my busy schedule easily.',
    rating: 5,
  },
];

export function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative gradient-mesh text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-violet-900/20 to-purple-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6"
              >
                <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse-soft" />
                <span className="text-sm font-medium">Now Enrolling New Students</span>
              </motion.div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Master Spanish with{' '}
                <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300">
                  Expert Teachers
                </span>
              </h1>
              <p className="mt-8 text-xl text-white/90 max-w-xl leading-relaxed">
                Join live online classes with native Spanish speakers. Whether you're a
                beginner or looking to perfect your fluency, we have the right class for you.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button size="xl" variant="emerald" asChild>
                  <Link to="/register">
                    Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-indigo-600"
                  asChild
                >
                  <Link to="/offerings">View Classes</Link>
                </Button>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-3 border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-large backdrop-blur-sm"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-5 w-5 fill-emerald-400 text-emerald-400 drop-shadow-lg" />
                    ))}
                  </div>
                  <p className="text-white/80 mt-2 font-medium">500+ happy students</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative float">
                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 rounded-3xl blur-2xl" />
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                    alt="Students learning Spanish online"
                    className="rounded-3xl shadow-xlarge border-4 border-white/20"
                  />
                  {/* Floating card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl text-slate-900 p-6 rounded-2xl shadow-xlarge border border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-colored-emerald">
                        <Video className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Live Session</p>
                        <p className="text-sm text-slate-600">Starting now</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900">
              Why Choose Us?
            </h2>
            <p className="mt-6 text-xl text-slate-600 leading-relaxed">
              Our platform makes learning Spanish convenient, effective, and enjoyable.
            </p>
          </motion.div>

          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Card hover variant="premium" className="h-full group">
                  <CardContent className="p-10">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-colored-indigo group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mt-8 text-2xl font-display font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-subtle" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                Benefits
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900">
                Everything You Need to Succeed
              </h2>
              <p className="mt-6 text-xl text-slate-600 leading-relaxed">
                Our comprehensive approach ensures you make real progress in your Spanish
                learning journey.
              </p>
              <ul className="mt-10 grid gap-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-soft hover:shadow-medium transition-shadow duration-200"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium text-lg">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
              <Button size="xl" className="mt-10" asChild>
                <Link to="/register">Get Started Today</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
                alt="Learning Spanish"
                className="rounded-3xl shadow-xlarge relative border-4 border-white/50"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-300 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-emerald-500/20">
              Testimonials
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              What Our Students Say
            </h2>
            <p className="mt-6 text-xl text-slate-300 leading-relaxed">
              Join hundreds of satisfied students who have improved their Spanish with us.
            </p>
          </motion.div>

          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <div className="h-full bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed">{testimonial.content}</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center font-bold text-white text-lg">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-12 lg:p-20 text-center overflow-hidden shadow-xlarge"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                  Ready to Start Speaking Spanish?
                </h2>
                <p className="mt-6 text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Book your first class today and take the first step towards fluency. No
                  commitment required.
                </p>
                <div className="mt-10 flex flex-wrap gap-4 justify-center">
                  <Button
                    size="xl"
                    variant="emerald"
                    className="bg-white text-indigo-600 hover:bg-slate-50 hover:text-indigo-700 shadow-xlarge"
                    asChild
                  >
                    <Link to="/register">
                      Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                    asChild
                  >
                    <Link to="/offerings">Browse Classes</Link>
                  </Button>
                </div>
                <p className="mt-8 text-sm text-white/70">
                  No credit card required • Cancel anytime • 14-day money-back guarantee
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
