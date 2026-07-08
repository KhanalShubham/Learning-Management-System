import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { navLinks } from '../data/navigation';
import { Container } from './ui/Container';

export function Footer() {
  const { data: site } = usePublicSiteInfo();

  return (
    <footer id="contact" className="bg-[var(--brand-charcoal)] text-white">
      <Container className="py-16 grid grid-cols-1 sm:grid-cols-3 gap-12">
        <div>
          <span className="font-display font-semibold text-lg block">
            {site?.schoolName ?? 'Deukhuri Public School'}
          </span>
          {site?.motto && <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-xs">{site.motto}</p>}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-4">Quick Links</p>
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.href.includes('#') ? (
                  <a href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </a>
                ) : (
                  <Link to={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link to="/public/fees" className="text-sm text-white/70 hover:text-white transition-colors">
                Fee Structure
              </Link>
            </li>
            <li>
              <a href="/public#campus-life" className="text-sm text-white/70 hover:text-white transition-colors">
                Campus Life
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-white/70">
            {site?.address && (
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{site.address}</span>
              </li>
            )}
            {site?.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${site.phone}`} className="hover:text-white transition-colors">
                  {site.phone}
                </a>
              </li>
            )}
            {site?.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${site.email}`} className="hover:text-white transition-colors">
                  {site.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {site?.schoolName ?? 'Deukhuri Public School'}. All rights reserved.
          </p>
          <p className="text-xs text-white/50">Lamahi-6, Dang, Nepal</p>
        </Container>
      </div>
    </footer>
  );
}
