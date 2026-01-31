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
      <section className="relative gradient-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Master Spanish with{' '}
                <span className="text-gradient">Expert Teachers</span>
              </h1>
              <p className="mt-6 text-lg text-navy-200 max-w-xl">
                Join live online classes with native Spanish speakers. Whether you're a
                beginner or looking to perfect your fluency, we have the right class for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="xl" variant="primary" asChild>
                  <Link to="/register">
                    Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-navy-800" asChild>
                  <Link to="/offerings">View Classes</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full bg-gold-400 border-2 border-navy-800 flex items-center justify-center text-navy-800 font-medium text-sm"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-navy-200 mt-1">500+ happy students</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-transparent rounded-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Students learning Spanish online"
                  className="rounded-2xl shadow-large"
                />
                {/* Floating card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white text-navy-800 p-4 rounded-xl shadow-large"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Video className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Live Session</p>
                      <p className="text-sm text-muted-foreground">Starting now</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-800">
              Why Choose Us?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our platform makes learning Spanish convenient, effective, and enjoyable.
            </p>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-8">
                    <div className="h-14 w-14 rounded-xl bg-gold-100 flex items-center justify-center">
                      <feature.icon className="h-7 w-7 text-gold-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-navy-800">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-800">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our comprehensive approach ensures you make real progress in your Spanish
                learning journey.
              </p>
              <ul className="mt-8 grid gap-3">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-navy-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
              <Button size="lg" className="mt-8" asChild>
                <Link to="/register">Get Started Today</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
                alt="Learning Spanish"
                className="rounded-2xl shadow-large"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-navy-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              What Our Students Say
            </h2>
            <p className="mt-4 text-lg text-navy-200">
              Join hundreds of satisfied students who have improved their Spanish with us.
            </p>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-navy-700/50 backdrop-blur p-8 rounded-xl"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-navy-100">{testimonial.content}</p>
                <div className="mt-6">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-navy-300">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-gold-400 to-gold-500 rounded-3xl p-12 lg:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-800">
                Ready to Start Speaking Spanish?
              </h2>
              <p className="mt-4 text-lg text-navy-700 max-w-xl mx-auto">
                Book your first class today and take the first step towards fluency. No
                commitment required.
              </p>
              <Button size="xl" className="mt-8" asChild>
                <Link to="/register">
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
