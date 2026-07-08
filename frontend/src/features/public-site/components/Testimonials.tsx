import { Quote } from 'lucide-react';
import { Container } from './ui/Container';
import { SectionHeading } from './ui/SectionHeading';
import { SectionReveal } from './ui/SectionReveal';
import { Card } from './ui/Card';
import { testimonials } from '../data/testimonials';

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-[var(--brand-white)]">
      <Container>
        <SectionHeading eyebrow="What They Say" title="From parents and alumni, in their own words" align="center" className="mx-auto" />

        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <SectionReveal key={t.name} delay={i * 0.1}>
              <Card className="h-full flex flex-col">
                <Quote className="h-6 w-6 text-[var(--brand-red)]" />
                <p className="mt-4 text-sm text-[var(--brand-text)] leading-relaxed flex-1">“{t.quote}”</p>
                <div className="mt-6 pt-6 border-t border-[var(--brand-border)]">
                  <p className="font-semibold text-sm text-[var(--brand-charcoal)]">{t.name}</p>
                  <p className="text-xs text-[var(--brand-text-soft)] mt-0.5">{t.role}</p>
                </div>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
