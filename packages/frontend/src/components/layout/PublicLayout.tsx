import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from '@/components/shared/SkipLink';
// Bricolage Grotesque Variable — ships only with public routes (code-split)
import '@fontsource-variable/bricolage-grotesque';

export function PublicLayout() {
  return (
    <div className="mkt-theme flex min-h-screen flex-col">
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
