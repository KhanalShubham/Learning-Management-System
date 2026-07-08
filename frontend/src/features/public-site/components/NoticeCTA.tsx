import { Link } from 'react-router-dom';
import { ArrowRight, Bell } from 'lucide-react';
import { Container } from './ui/Container';
import { SectionReveal } from './ui/SectionReveal';

export function NoticeCTA() {
  return (
    <section className="bg-[var(--brand-charcoal)] py-16">
      <Container>
        <SectionReveal className="flex flex-col lg:flex-row items-center justify-between gap-8 rounded-[var(--radius-card)] bg-[var(--brand-charcoal-700)] px-8 py-10 sm:px-12">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="hidden sm:flex h-12 w-12 shrink-0 rounded-full bg-white/10 items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">Never miss a notice</h3>
              <p className="mt-2 text-sm text-white/70">
                Term dates, exam routines, and event announcements are posted to the notice board the same day.
              </p>
            </div>
          </div>

          <Link
            to="/public/notices"
            className="inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)] transition-colors"
          >
            Browse the Notice Board <ArrowRight className="h-4 w-4" />
          </Link>
        </SectionReveal>
      </Container>
    </section>
  );
}
