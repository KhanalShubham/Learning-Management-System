import { Mail, MapPin, Phone } from 'lucide-react';
import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { Container } from './ui/Container';

// Non-functional placeholder until i18n is actually wired up — flags the
// intent without pretending translation exists yet.
function LanguageSwitch() {
  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button type="button" className="text-white" aria-current="true">
        EN
      </button>
      <span className="text-white/30">/</span>
      <button type="button" className="text-white/50 hover:text-white/80 transition-colors">
        ने
      </button>
    </div>
  );
}

export function TopBar() {
  const { data: site } = usePublicSiteInfo();

  if (!site?.phone && !site?.email && !site?.address) {
    return null;
  }

  return (
    <div className="bg-[var(--brand-charcoal)] text-white/80 text-xs">
      <Container className="flex items-center justify-between py-2">
        <div className="flex items-center gap-5">
          {site?.phone && (
            <a href={`tel:${site.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{site.phone}</span>
            </a>
          )}
          {site?.email && (
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{site.email}</span>
            </a>
          )}
          {site?.address && (
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {site.address}
            </span>
          )}
        </div>

        <LanguageSwitch />
      </Container>
    </div>
  );
}
