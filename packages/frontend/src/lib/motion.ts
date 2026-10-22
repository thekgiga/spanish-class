import type { Variants } from 'framer-motion';

// Fade-up reveal (used by VibrantFadeUp helper)
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// Stagger container for grids (parent → children inherit delay)
export const staggerGrid: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// 3D tilt hover for BentoCell / GlassCard (applied via whileHover)
export const tiltHover: Variants = {
  rest: { rotateX: 0, rotateY: 0, scale: 1 },
  hover: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

// Magnetic CTA glow pulse for FinalCTA button (applied via whileHover)
export const magneticCta: Variants = {
  rest: { boxShadow: '0 0 0px 0px hsl(355 76% 56% / 0)' },
  hover: {
    boxShadow: '0 0 32px 8px hsl(355 76% 56% / 0.45)',
    transition: { duration: 0.3 },
  },
};

// Page transition (fade + 8px rise, used in PublicLayout AnimatePresence)
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};
