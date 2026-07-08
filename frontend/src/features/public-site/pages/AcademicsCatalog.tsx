import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Container';
import { Badge } from '../components/ui/Badge';
import { SectionReveal } from '../components/ui/SectionReveal';
import { gradeLevels } from '../data/academics';

export const AcademicsCatalog = () => {
  return (
    <div>
      <PageHero
        eyebrow="Academics"
        title="Four levels, one continuous curriculum"
        description="Every level builds on the one before it — see what's taught, and what a student picks up beyond the textbook, at each stage."
        crumbs={[{ label: 'Home', to: '/public' }, { label: 'Academics' }]}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid sm:grid-cols-2 gap-6">
          {gradeLevels.map((grade, i) => (
            <SectionReveal key={grade.slug} delay={i * 0.08}>
              <Link
                to={`/public/academics/${grade.slug}`}
                className="group block h-full rounded-[var(--radius-card)] border border-[var(--brand-border)] bg-[var(--brand-white)] p-8 hover:border-[var(--brand-red)] transition-colors"
              >
                <Badge tone={grade.tone}>{grade.range}</Badge>
                <h2 className="font-display mt-4 text-2xl font-semibold text-[var(--brand-charcoal)]">
                  {grade.label}
                </h2>
                <p className="mt-3 text-sm text-[var(--brand-text-soft)] leading-relaxed">{grade.description}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)]">
                  View curriculum
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </SectionReveal>
          ))}
        </Container>
      </section>
    </div>
  );
};

export default AcademicsCatalog;
