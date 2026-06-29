import { useTranslation } from 'react-i18next';

/**
 * SkipLink — WCAG 2.4.1 bypass-block for public-layout pages.
 * For authenticated pages use AppSkipLink from @/components/ui/app-shell.
 */
export function SkipLink() {
  const { t } = useTranslation('common');
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-2 focus:rounded-ui-sm focus:bg-brand focus:text-brand-contrast focus:shadow-ui-2 focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:text-small focus:font-semibold"
    >
      {t('aria_labels.skip_to_main')}
    </a>
  );
}
