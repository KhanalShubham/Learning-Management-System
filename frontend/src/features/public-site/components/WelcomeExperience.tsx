import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { SchoolMark } from './ui/SchoolMark';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

const SEEN_KEY = 'deukhuri-welcome-seen';

export function WelcomeExperience() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data: site } = usePublicSiteInfo();

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;

    // Let the hero paint first so the welcome dialog doesn't fight the
    // initial page load for attention.
    const timer = setTimeout(() => {
      dialogRef.current?.showModal();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(SEEN_KEY, 'true');
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="welcome-dialog rounded-[var(--radius-card)]"
      aria-labelledby="welcome-heading"
      onClose={() => sessionStorage.setItem(SEEN_KEY, 'true')}
    >
      <div className="relative bg-[var(--brand-white)] rounded-[var(--radius-card)] shadow-[var(--shadow-lg)] p-10 text-center">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss welcome message"
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--brand-text-soft)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-charcoal)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex justify-center">
          <SchoolMark className="h-16 w-16 text-2xl" />
        </div>

        <div className="mt-5 flex justify-center">
          <Badge tone="red">Admission Open</Badge>
        </div>

        <h2
          id="welcome-heading"
          className="font-display mt-4 text-2xl font-semibold text-[var(--brand-charcoal)]"
        >
          Welcome to {site?.schoolName ?? 'Deukhuri Public School'}
        </h2>

        <p className="mt-3 text-sm text-[var(--brand-text-soft)] leading-relaxed max-w-sm mx-auto">
          {site?.motto ??
            site?.description ??
            'Quality education that builds confident, disciplined, creative and responsible citizens.'}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="#admissions" variant="primary" onClick={handleClose}>
            Apply for Admission
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Explore Website
          </Button>
        </div>
      </div>
    </dialog>
  );
}
