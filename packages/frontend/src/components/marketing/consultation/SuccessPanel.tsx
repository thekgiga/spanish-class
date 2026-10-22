import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

/**
 * Shown after successful form submission.
 */
export function SuccessPanel() {
  const { t } = useTranslation('about');

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex flex-col items-center text-center py-12 px-6 space-y-6"
    >
      {/* Icon ring */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
        className="flex items-center justify-center w-20 h-20 rounded-full"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--mkt-sol)), hsl(var(--mkt-fiesta)))',
          boxShadow: '0 0 40px hsl(var(--mkt-fiesta)/0.35)',
        }}
        aria-hidden="true"
      >
        <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[hsl(var(--mkt-azahar))]">
          {t('consultation.success.title')}
        </h2>
        <p className="text-[hsl(var(--mkt-azahar)/0.75)] max-w-xs mx-auto leading-relaxed">
          {t('consultation.success.message')}
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-sol))]"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--mkt-sol)), hsl(var(--mkt-fiesta)))',
          color: 'white',
        }}
      >
        {t('consultation.success.cta')}
      </Link>
    </motion.div>
  );
}
