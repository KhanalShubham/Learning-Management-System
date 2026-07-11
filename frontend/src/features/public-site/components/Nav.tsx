import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { navLinks } from '../data/navigation';
import { Button } from './ui/Button';
import { SchoolMark } from './ui/SchoolMark';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { data: site } = usePublicSiteInfo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-[var(--duration-standard)] border-b',
        scrolled
          ? 'glass-nav border-[var(--brand-border)]'
          : 'bg-transparent border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <SchoolMark className="h-10 w-10" />
          <span className="font-display font-semibold text-lg text-[var(--brand-charcoal)] leading-none">
            {site?.schoolName ?? 'Deukhuri Public School'}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--brand-text-soft)]">
          {navLinks.map((link) =>
            link.href.includes('#') ? (
              <a key={link.href} href={link.href} className="hover:text-[var(--brand-charcoal)] transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} to={link.href} className="hover:text-[var(--brand-charcoal)] transition-colors">
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-[var(--brand-text-soft)] hover:text-[var(--brand-charcoal)] transition-colors px-3 py-2 hidden sm:inline-block"
          >
            ERP Login
          </Link>
          <Button href="#admissions" className="!px-5 !py-2.5 !text-[13px]">
            Apply Now
          </Button>
        </div>
      </div>
    </header>
  );
}
