/**
 * SkipLink Component
 * 
 * Accessibility skip-to-content link for keyboard navigation
 * Allows screen reader users and keyboard-only users to skip navigation
 * 
 * WCAG 2.1 Success Criterion 2.4.1: Bypass Blocks (Level A)
 * 
 * Usage: Place at the very beginning of the app, before any other content
 */

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-spanish-red-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-spanish-red-500 focus:ring-offset-2 focus:font-medium"
    >
      Skip to main content
    </a>
  );
}
