/**
 * useOptimizedAnimation Hook
 * 
 * GPU-accelerated animations respecting reduced motion preference
 * Uses only transform and opacity for 60fps performance
 */

import { useReducedMotion } from './useReducedMotion';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
}

export function useOptimizedAnimation(config: AnimationConfig = {}) {
  const prefersReducedMotion = useReducedMotion();
  
  const {
    duration = 300,
    delay = 0,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  } = config;

  // Return instant transitions if reduced motion is preferred
  if (prefersReducedMotion) {
    return {
      transition: { duration: 0 },
      variants: {},
    };
  }

  // GPU-accelerated animations only (transform and opacity)
  return {
    transition: {
      duration: duration / 1000, // Convert to seconds for Framer Motion
      delay: delay / 1000,
      ease: easing,
    },
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
  };
}

// Preset animation variants for common use cases
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// Only use GPU-accelerated properties
export const optimizedTransition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeOut',
};
