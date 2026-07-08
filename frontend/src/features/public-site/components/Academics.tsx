import { ArrowRight, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui/Container';
import { SectionHeading } from './ui/SectionHeading';
import { SectionReveal } from './ui/SectionReveal';
import { Badge } from './ui/Badge';
import { gradeLevels, portalFeatures } from '../data/academics';

export function Academics() {
  return (
    <section id="academics" className="py-24 sm:py-32 bg-[var(--brand-white)]">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Academics" title="Four levels, one continuous journey" />
          <Link
            to="/public/academics"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors"
          >
            Explore the curriculum <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {gradeLevels.map((grade, i) => (
            <SectionReveal key={grade.slug} delay={i * 0.06}>
              <Link
                to={`/public/academics/${grade.slug}`}
                className="block rounded-[var(--radius-card)] border border-[var(--brand-border)] px-6 py-5 min-w-[180px] hover:border-[var(--brand-red)] transition-colors"
              >
                <Badge tone={grade.tone}>{grade.range}</Badge>
                <p className="font-display mt-3 text-base font-semibold text-[var(--brand-charcoal)]">
                  {grade.label}
                </p>
              </Link>
            </SectionReveal>
          ))}
        </div>

        <div className="mt-20 grid lg:grid-cols-2 gap-16 items-center">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)] mb-3">
              The parent portal
            </p>
            <h3 className="font-display text-3xl font-semibold text-[var(--brand-charcoal)] leading-tight">
              Everything a report card used to hide until term-end
            </h3>
            <ul className="mt-8 space-y-6">
              {portalFeatures.map((feature) => (
                <li key={feature.title} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[var(--brand-green)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--brand-charcoal)] text-sm">{feature.title}</p>
                    <p className="mt-1 text-sm text-[var(--brand-text-soft)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <div className="aspect-[4/3] rounded-[var(--radius-card)] bg-[var(--brand-surface)] border border-[var(--brand-border)] shadow-[var(--shadow-md)] flex flex-col items-center justify-center gap-3 text-[var(--brand-text-soft)]">
              <LayoutDashboard className="h-10 w-10" />
              <p className="text-sm font-medium">Parent portal preview coming soon</p>
            </div>
          </SectionReveal>
        </div>
      </Container>
    </section>
  );
}
