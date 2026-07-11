import { Link, Navigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { SectionReveal } from '../components/ui/SectionReveal';
import { gradeLevels } from '../data/academics';

export const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const grade = gradeLevels.find((g) => g.slug === slug);

  if (!grade) {
    return <Navigate to="/academics" replace />;
  }

  return (
    <div>
      <PageHero
        eyebrow={grade.range}
        title={grade.label}
        description={grade.description}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Academics', to: '/academics' },
          { label: grade.label },
        ]}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid lg:grid-cols-2 gap-16">
          <SectionReveal>
            <h2 className="font-display text-xl font-semibold text-[var(--brand-charcoal)] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--brand-red)]" /> Subjects taught
            </h2>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {grade.subjects.map((subject) => (
                <span
                  key={subject}
                  className="rounded-[var(--radius-pill)] border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-charcoal)]"
                >
                  {subject}
                </span>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h2 className="font-display text-xl font-semibold text-[var(--brand-charcoal)]">Beyond the textbook</h2>
            <ul className="mt-6 space-y-4">
              {grade.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-sm text-[var(--brand-text-soft)] leading-relaxed">
                  <CheckCircle2 className="h-5 w-5 text-[var(--brand-green)] shrink-0 mt-0.5" />
                  {highlight}
                </li>
              ))}
            </ul>
          </SectionReveal>
        </Container>

        <Container className="mt-16">
          <div className="rounded-[var(--radius-card)] bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-[var(--brand-charcoal)]">
                Ready to enrol for {grade.label}?
              </h3>
              <p className="mt-1 text-sm text-[var(--brand-text-soft)]">
                Check the fee structure and start the admission conversation.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button to="/fees" variant="outline">
                View Fees
              </Button>
              <Button href="#admissions" variant="primary">
                Apply Now
              </Button>
            </div>
          </div>
        </Container>

        <Container className="mt-10">
          <Link to="/academics" className="text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors">
            ← Back to all levels
          </Link>
        </Container>
      </section>
    </div>
  );
};

export default ProgramDetail;
