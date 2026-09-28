import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { BookOpen, GraduationCap, Languages, Lightbulb } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// ── Single (default) — one item open at a time ─────────────────────────────
export const Single: Story = {
  render: () => (
    <Accordion type="single" className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>What is included?</AccordionTrigger>
        <AccordionContent>
          Private and group Spanish lessons from A1 to C1, DELE/SIELE exam
          preparation, and personalised study plans.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>How do I book a lesson?</AccordionTrigger>
        <AccordionContent>
          Choose an available time slot in the calendar, confirm your request,
          and the professor will approve it — usually within a few hours.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Can I reschedule?</AccordionTrigger>
        <AccordionContent>
          Yes. Cancel the booking from your dashboard and request a new slot.
          Cancellations less than 24 hours before the lesson may be charged.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ── Collapsible — all items can be closed ──────────────────────────────────
export const Collapsible: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>Our approach</AccordionTrigger>
        <AccordionContent>
          We focus on practical communication from day one, combining structured
          grammar with real-world conversation practice.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Lesson formats</AccordionTrigger>
        <AccordionContent>
          One-to-one online lessons (45 or 60 minutes), small group courses
          (3–6 students), and intensive workshops.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ── Multiple — several items can be open simultaneously ─────────────────────
export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>Spanish language</AccordionTrigger>
        <AccordionContent>
          Private and group lessons from A1 to C1. DELE and SIELE preparation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Studies in Spain</AccordionTrigger>
        <AccordionContent>
          University guidance — from first search to final enrolment.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Language camps</AccordionTrigger>
        <AccordionContent>
          Immersive summer camps for young people and teenagers.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ── DefaultOpen — pre-expanded item ────────────────────────────────────────
export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="b" className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>General questions</AccordionTrigger>
        <AccordionContent>
          We offer online and in-person lessons in Spanish, tailored to your level
          and goals.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Pricing</AccordionTrigger>
        <AccordionContent>
          Trial lesson is free. Single lessons start from €30. Monthly packages
          with priority scheduling are available from €100/month.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Certification</AccordionTrigger>
        <AccordionContent>
          We prepare students for DELE (Instituto Cervantes) and SIELE exams at
          all levels (A1–C2).
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ── FAQ — realistic multi-item use case ────────────────────────────────────
export const FAQ: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-2">
      <h3 className="font-display text-lg font-semibold text-ink">
        Frequently asked questions
      </h3>
      <Accordion type="single" collapsible className="w-full">
        {[
          {
            q: 'Do I need any Spanish before starting?',
            a: 'No. We accept complete beginners (A1) as well as advanced speakers (C1) looking to polish their skills.',
          },
          {
            q: 'How long is each lesson?',
            a: 'Standard lessons are 45 or 60 minutes. Intensive sessions of 90 minutes are available on request.',
          },
          {
            q: 'Can lessons be done online?',
            a: 'Yes — all lessons are available online via video call. We use a shared whiteboard and interactive materials.',
          },
          {
            q: 'What happens if I miss a lesson?',
            a: 'Cancel at least 24 hours in advance to reschedule without charge. Late cancellations are billed at the standard rate.',
          },
        ].map(({ q, a }, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent>{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

// ── Editorial reveal — borderless, custom trigger (mirrors AboutPage usage) ─
export const EditorialReveal: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <p className="text-base leading-relaxed text-ink-secondary">
        Elite Education was founded with a single goal: to make education in
        Spain genuinely accessible to everyone, regardless of where they start.
      </p>
      <Accordion type="single" collapsible>
        <AccordionItem value="mission" className="border-0">
          <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-widest text-accent hover:text-accent/80">
            Read our mission
          </AccordionTrigger>
          <AccordionContent className="pt-1">
            <p className="text-base leading-relaxed text-ink-secondary">
              We guide students through every step — from learning Spanish to
              applying to university, finding accommodation, and settling in.
              Our work is complete only when the student feels at home.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// ── With icons — icon in trigger area ─────────────────────────────────────
export const WithIcons: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      {[
        { icon: Languages, label: 'Spanish language', value: 's01', body: 'Private and group Spanish lessons from A1 to C1.' },
        { icon: GraduationCap, label: 'Studies in Spain', value: 's02', body: 'University guidance from first search to final enrolment.' },
        { icon: BookOpen, label: 'Language camps', value: 's03', body: 'Immersive summer camps for young people and teenagers.' },
        { icon: Lightbulb, label: 'Consultations', value: 's04', body: 'Expert advice for planning your education in Spain.' },
      ].map(({ icon: Icon, label, value, body }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-accent flex-shrink-0" aria-hidden />
              {label}
            </span>
          </AccordionTrigger>
          <AccordionContent>{body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

// ── Long content — verifies overflow and padding ────────────────────────────
export const LongContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>Full programme details</AccordionTrigger>
        <AccordionContent>
          <p className="mb-3">
            Our Spanish language programme is structured around the CEFR
            framework (A1–C2). Each level is divided into two sub-levels with
            dedicated grammar and vocabulary goals.
          </p>
          <p className="mb-3">
            Lessons are delivered by qualified native-speaker professors with
            at least five years of ELE (Spanish as a Foreign Language) teaching
            experience and relevant certifications (MAELE, FELE, or equivalent).
          </p>
          <p>
            Progress is assessed through informal check-ins every four weeks.
            At the end of each level, a structured assessment confirms readiness
            to advance. Preparation for DELE and SIELE exams is integrated
            from B1 onwards.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Short item</AccordionTrigger>
        <AccordionContent>Brief response for contrast.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
