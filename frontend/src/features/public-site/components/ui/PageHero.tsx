import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

interface Crumb {
  label: string;
  to?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs: Crumb[];
}) {
  return (
    <section className="bg-[var(--brand-surface)] border-b border-[var(--brand-border)] py-16 sm:py-20">
      <Container>
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--brand-text-soft)] mb-6" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-[var(--brand-charcoal)] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--brand-charcoal)] font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)] mb-3">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--brand-charcoal)] max-w-2xl leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base text-[var(--brand-text-soft)] max-w-xl leading-relaxed">{description}</p>
        )}
      </Container>
    </section>
  );
}
