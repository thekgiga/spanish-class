import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 * 
 * Detects user's motion preference for accessibility
 * Returns true if user prefers reduced motion
 * 
 * Used to disable animations for users with vestibular disorders
 * or motion sensitivity (WCAG 2.1 Success Criterion 2.3.3)
 * 
 * @returns boolean - true if user prefers reduced motion
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * 
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
 *   transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
 * >
 *   Content
 * </motion.div>
 */
export function useReducedMotion(): boolean {
  // Default to false to avoid hydration mismatch
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener for changes
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Legacy browsers (Safari < 14)
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * getReducedMotionDuration
 * 
 * Helper function to get animation duration based on motion preference
 * Returns 0 if reduced motion is preferred, otherwise returns specified duration
 * 
 * @param prefersReducedMotion - boolean from useReducedMotion hook
 * @param duration - desired animation duration in seconds
 * @returns number - animation duration (0 if reduced motion)
 * 
 * @example
 * const duration = getReducedMotionDuration(prefersReducedMotion, 0.3);
 * // Returns 0 if reduced motion, 0.3 otherwise
 */
export function getReducedMotionDuration(
  prefersReducedMotion: boolean,
  duration: number
): number {
  return prefersReducedMotion ? 0 : duration;
}

/**
 * getReducedMotionVariants
 * 
 * Helper function to get Framer Motion variants with reduced motion support
 * Returns empty variants if reduced motion is preferred
 * 
 * @param prefersReducedMotion - boolean from useReducedMotion hook
 * @param variants - Framer Motion variants object
 * @returns object - variants (empty if reduced motion)
 * 
 * @example
 * const variants = getReducedMotionVariants(prefersReducedMotion, {
 *   hidden: { opacity: 0, y: 20 },
 *   visible: { opacity: 1, y: 0 },
 * });
 */
export function getReducedMotionVariants<T extends Record<string, any>>(
  prefersReducedMotion: boolean,
  variants: T
): T | Record<string, never> {
  if (prefersReducedMotion) {
    // Return empty object to disable animations
    return {} as Record<string, never>;
  }
  return variants;
}

/**
 * useMotionConfig
 * 
 * Returns Framer Motion config object with reduced motion support
 * Automatically sets duration to 0 if reduced motion is preferred
 * 
 * @returns object - Framer Motion transition config
 * 
 * @example
 * const motionConfig = useMotionConfig();
 * <motion.div {...motionConfig.transition}>Content</motion.div>
 */
export function useMotionConfig() {
  const prefersReducedMotion = useReducedMotion();

  return {
    transition: {
      duration: prefersReducedMotion ? 0 : 0.3,
      ease: 'easeInOut',
    },
    prefersReducedMotion,
  };
}

export default useReducedMotion;
