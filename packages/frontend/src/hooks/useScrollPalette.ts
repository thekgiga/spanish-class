import { useRef, useCallback } from 'react';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

export interface ScrollPaletteStop {
  /** 0–1 progress through the container */
  progress: number;
  /** Complete CSS color value, e.g. "hsl(42 68% 97%)" */
  bg: string;
  /** Complete CSS color value for a secondary tint */
  tint: string;
}

/**
 * Wires up scroll-triggered CSS variable transitions on a container element.
 * Writes --mkt-journey-bg and --mkt-journey-tint via style.setProperty (one rAF,
 * zero React re-renders). Reduced motion → CSS transition handles the hop
 * between static stop values without animation.
 *
 * The predefined JOURNEY_STOPS export matches the plan's daylight→noche sequence.
 */
export function useScrollPalette(stops: ScrollPaletteStop[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const progressValues = stops.map((s) => s.progress);
  const bgValues = stops.map((s) => s.bg);
  const tintValues = stops.map((s) => s.tint);

  const bgMotion = useTransform(scrollYProgress, progressValues, bgValues);
  const tintMotion = useTransform(scrollYProgress, progressValues, tintValues);

  const setProps = useCallback((bg: string, tint: string) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--mkt-journey-bg', bg);
    el.style.setProperty('--mkt-journey-tint', tint);
  }, []);

  useMotionValueEvent(bgMotion, 'change', (v) => {
    if (!prefersReduced) {
      containerRef.current?.style.setProperty('--mkt-journey-bg', v);
    }
  });

  useMotionValueEvent(tintMotion, 'change', (v) => {
    if (!prefersReduced) {
      containerRef.current?.style.setProperty('--mkt-journey-tint', v);
    }
  });

  return { containerRef, prefersReduced, setProps };
}

/** Plan-defined scroll journey: azahar (dawn) → sol (midday) → mediterráneo → noche (conversion) */
export const JOURNEY_STOPS: ScrollPaletteStop[] = [
  { progress: 0,    bg: 'hsl(42 68% 97%)',  tint: 'hsl(221 51% 16%)' }, // azahar
  { progress: 0.3,  bg: 'hsl(42 100% 92%)', tint: 'hsl(42 100% 51%)' }, // sol warm
  { progress: 0.6,  bg: 'hsl(193 35% 90%)', tint: 'hsl(193 70% 43%)' }, // mediterráneo
  { progress: 0.85, bg: 'hsl(221 51% 18%)', tint: 'hsl(42 100% 51%)' }, // noche (conversion)
  { progress: 1,    bg: 'hsl(221 51% 14%)', tint: 'hsl(355 76% 56%)' }, // deep noche
];
