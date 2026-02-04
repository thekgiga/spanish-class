import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Users, User, Clock, Calendar, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const classTypes = [
  {
    title: 'Individual Sessions',
    description: 'One-on-one personalized lessons tailored to your specific goals and pace.',
    icon: User,
    badge: 'Most Popular',
    features: [
      'Personalized curriculum',
      '100% focused attention',
      'Flexible scheduling',
      'Custom pace and topics',
      'Detailed progress tracking',
      'Homework and exercises',
    ],
    duration: '60 minutes',
    format: 'Video call',
  },
  {
    title: 'Group Classes',
    description: 'Interactive sessions with fellow learners. Practice conversation in a social setting.',
    icon: Users,
    features: [
      'Max 5 students per group',
      'Interactive discussions',
      'Peer learning benefits',
      'Competitive pricing',
      'Fun group activities',
      'Make new friends',
    ],
    duration: '60 minutes',
    format: 'Video call',
  },
];

const topics = [
  {
    title: 'Conversation Practice',
    description: 'Improve fluency through guided conversations on everyday topics.',
    level: 'All Levels',
  },
  {
    title: 'Grammar Workshops',
    description: 'Master Spanish grammar with clear explanations and practice exercises.',
    level: 'Beginner to Advanced',
  },
  {
    title: 'Business Spanish',
    description: 'Professional vocabulary and communication for the workplace.',
    level: 'Intermediate+',
  },
  {
    title: 'DELE Exam Preparation',
    description: 'Comprehensive training for DELE certification from Instituto Cervantes. All levels from A1 to C2.',
    level: 'All Levels',
  },
  {
    title: 'University Enrollment Support',
    description: 'Assistance with enrollment in foreign universities, including language requirements and application guidance.',
    level: 'Intermediate+',
  },
  {
    title: 'Translation Services',
    description: 'Professional translation of documents, academic materials, and business communications.',
    level: 'Professional',
  },
  {
    title: 'Travel Spanish',
    description: 'Essential phrases and cultural tips for traveling in Spanish-speaking countries.',
    level: 'Beginner',
  },
  {
    title: 'Cultural Immersion',
    description: 'Learn about Spanish and Latin American culture, traditions, and customs.',
    level: 'All Levels',
  },
];

export function OfferingsPage() {
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
            <h1 className="font-display text-4xl sm:text-5xl font-bold">Our Classes & Services</h1>
            <p className="mt-6 text-xl text-slate-300">
              From general Spanish lessons to DELE exam preparation, university enrollment assistance,
              and professional translation services – all tailored to your specific goals and conducted
              live via video call with an experienced Spanish teacher.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Class Types */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {classTypes.map((classType, index) => (
              <motion.div
                key={classType.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full relative">
                  {classType.badge && (
                    <Badge variant="gold" className="absolute -top-3 right-6">
                      {classType.badge}
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
                      <classType.icon className="h-7 w-7 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl">{classType.title}</CardTitle>
                    <CardDescription className="text-base">
                      {classType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {classType.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Video className="h-4 w-4" />
                        {classType.format}
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {classType.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-indigo-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-8" variant="primary" asChild>
                      <Link to="/register">Book a Session</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Topics We Cover
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From beginner basics to advanced conversation, we have sessions for every goal.
            </p>
          </motion.div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-4">
                      {topic.level}
                    </Badge>
                    <h3 className="text-lg font-semibold text-slate-900">{topic.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{topic.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Getting started is easy. Book your first class in minutes.
            </p>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Account',
                description: 'Sign up for free and tell us about your learning goals.',
              },
              {
                step: '2',
                title: 'Browse & Book',
                description: 'Choose from available time slots that fit your schedule.',
              },
              {
                step: '3',
                title: 'Join & Learn',
                description: 'Connect via Google Meet and start speaking Spanish!',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-colored-indigo">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="primary" asChild>
              <Link to="/register">
                <Calendar className="mr-2 h-5 w-5" />
                Book Your First Class
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
