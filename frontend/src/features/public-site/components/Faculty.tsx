import { ArrowRight, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui/Container';
import { SectionHeading } from './ui/SectionHeading';
import { SectionReveal } from './ui/SectionReveal';
import { Badge } from './ui/Badge';
import { departments } from '../data/faculty';

export function Faculty() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Our Faculty"
            title="Departments behind the classroom"
            subtitle="Twenty-four teachers, grouped by subject, each carrying a manageable class load so no student goes unnoticed."
          />
          <Link
            to="/faculty"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors"
          >
            Meet the teachers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept, i) => (
            <SectionReveal key={dept.name} delay={i * 0.08}>
              <div className="h-full rounded-[var(--radius-card)] border border-[var(--brand-border)] bg-[var(--brand-white)] p-6">
                <div className="h-11 w-11 rounded-[var(--radius-control)] bg-[var(--brand-surface)] flex items-center justify-center">
                  <Users2 className="h-5 w-5 text-[var(--brand-charcoal-700)]" />
                </div>
                <h3 className="font-display mt-5 text-base font-semibold text-[var(--brand-charcoal)] leading-snug">
                  {dept.name}
                </h3>
                <div className="mt-4">
                  <Badge tone={dept.tone}>{dept.teachers} Teachers</Badge>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
