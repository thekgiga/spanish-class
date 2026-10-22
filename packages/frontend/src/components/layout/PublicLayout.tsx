import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from '@/components/shared/SkipLink';
import { pageTransition } from '@/lib/motion';
// Bricolage Grotesque Variable — ships only with public routes (code-split)
import '@fontsource-variable/bricolage-grotesque';

export function PublicLayout() {
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  return (
    <div className="mkt-theme flex min-h-screen flex-col">
      <SkipLink />
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          id="main-content"
          className="flex-1"
          tabIndex={-1}
          variants={prefersReduced ? undefined : pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
