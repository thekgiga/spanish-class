import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ── Fade-up entrance animation ─────────────────────────────────────────────

export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Gold rule divider ──────────────────────────────────────────────────────

export function GoldRule({ className }: { className?: string }) {
  return (
    <div
      className={`h-px w-16 bg-accent ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

// ── Section label chip ─────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
      {children}
    </p>
  );
}

// ── Spine rail — animated gold line running through a section ─────────────
// Absolutely positioned inside the section so it paints above the bg.

export function SpineRail({ railClass = 'bg-accent' }: { railClass?: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-4 sm:left-6 lg:left-8 -translate-x-1/2 z-10"
    >
      <motion.div
        className={`w-0.5 h-full ${railClass} origin-top`}
        initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
        }
        viewport={{ once: true, margin: "-5%" }}
      />
    </div>
  );
}

// ── Spine node — gold dot centered on the spine x-axis ────────────────────

export function SpineNode({ className, dotClass = 'bg-accent ring-accent/30' }: { className?: string; dotClass?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-4 sm:left-6 lg:left-8 -translate-x-1/2 z-20 h-3 w-3 rounded-full ring-2 ring-offset-1 ${dotClass} ${className ?? ""}`}
    />
  );
}

// ── Page header — consistent inner-page title block ────────────────────────

export function PageHeader({
  label,
  title,
  subtitle,
  spineIndent = false,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  /** Set true when the page uses SpineRail so the heading aligns with body text */
  spineIndent?: boolean;
}) {
  const innerCls = spineIndent
    ? "mx-auto max-w-screen-xl px-4 pl-8 sm:px-6 sm:pl-10 lg:px-8 lg:pl-16"
    : "mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8";
  return (
    <div className="bg-canvas border-b border-line py-16 sm:py-24">
      <div className={innerCls}>
        {label && <SectionLabel>{label}</SectionLabel>}
        <GoldRule className="mb-6" />
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-secondary">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
