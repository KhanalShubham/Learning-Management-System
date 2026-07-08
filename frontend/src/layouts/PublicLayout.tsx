import { Outlet } from 'react-router-dom';
import '@/styles/tokens.css';
import { TopBar } from '@/features/public-site/components/TopBar';
import { Nav } from '@/features/public-site/components/Nav';
import { NoticeCTA } from '@/features/public-site/components/NoticeCTA';
import { Footer } from '@/features/public-site/components/Footer';

export const PublicLayout = () => {
  return (
    <div className="public-site flex flex-col min-h-screen selection:bg-[var(--brand-red-light)]">
      <TopBar />
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <NoticeCTA />
      <Footer />
    </div>
  );
};
export default PublicLayout;
