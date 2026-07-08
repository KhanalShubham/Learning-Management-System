import { GraduationCap, Quote } from 'lucide-react';
import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { Container } from './ui/Container';
import { SectionReveal } from './ui/SectionReveal';

export function PrincipalMessage() {
  const { data: site } = usePublicSiteInfo();

  return (
    <section className="py-24 sm:py-32 bg-[var(--brand-white)]">
      <Container className="grid lg:grid-cols-[280px_1fr] gap-12 items-center">
        <SectionReveal>
          <div className="mx-auto lg:mx-0 w-56 lg:w-full aspect-square rounded-[var(--radius-card)] overflow-hidden bg-[var(--brand-surface)] border border-[var(--brand-border)] shadow-[var(--shadow-md)]">
            {site?.principal?.photoUrl ? (
              <img
                src={site.principal.photoUrl}
                alt={site.principal.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[var(--brand-text-soft)]">
                <GraduationCap className="h-10 w-10" />
              </div>
            )}
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <Quote className="h-8 w-8 text-[var(--brand-red)]" />
          <p className="font-display mt-4 text-2xl sm:text-3xl font-semibold text-[var(--brand-charcoal)] leading-snug max-w-2xl">
            "Every child who walks through our gate leaves a little more curious, a little more capable, than the
            day before. That's the only measure of a school year that has ever mattered to me."
          </p>
          <div className="mt-6">
            <p className="font-semibold text-[var(--brand-charcoal)]">
              {site?.principal?.name ?? 'The Principal'}
            </p>
            <p className="text-sm text-[var(--brand-text-soft)]">
              Principal, {site?.schoolName ?? 'Deukhuri Public School'}
            </p>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
