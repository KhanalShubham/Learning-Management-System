import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Container } from './ui/Container';
import { SectionHeading } from './ui/SectionHeading';
import { SectionReveal } from './ui/SectionReveal';
import { faqs } from '../data/faqs';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 sm:py-32 bg-[var(--brand-white)]">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Questions" title="Before you visit the office" align="center" className="mx-auto" />

        <div className="mt-12 divide-y divide-[var(--brand-border)] border-y border-[var(--brand-border)]">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <SectionReveal key={faq.question} delay={i * 0.05}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="font-semibold text-[var(--brand-charcoal)]">{faq.question}</span>
                  <Plus
                    className={cn(
                      'h-5 w-5 shrink-0 text-[var(--brand-red)] transition-transform duration-[var(--duration-standard)]',
                      open && 'rotate-45'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-[var(--duration-standard)] ease-[var(--ease-standard)]',
                    open ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'
                  )}
                >
                  <p className="overflow-hidden text-sm text-[var(--brand-text-soft)] leading-relaxed max-w-2xl">
                    {faq.answer}
                  </p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
