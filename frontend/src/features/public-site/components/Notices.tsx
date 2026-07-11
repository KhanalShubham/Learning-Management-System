import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui/Container';
import { SectionHeading } from './ui/SectionHeading';
import { SectionReveal } from './ui/SectionReveal';
import { Badge } from './ui/Badge';
import { usePublicNotices } from '../hooks/useNotices';
import type { NoticeTag } from '../types';

const tagLabel: Record<NoticeTag, string> = {
  ADMISSIONS: 'Admissions',
  EXAMINATION: 'Examination',
  EVENT: 'Event',
  NOTICE: 'Notice',
};

export function Notices() {
  const { data } = usePublicNotices();
  const notices = (data?.data ?? []).slice(0, 3);

  if (notices.length === 0) return null;

  return (
    <section id="notices" className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Notices" title="Latest from the notice board" />
          <Link
            to="/notices"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors"
          >
            View all notices <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {notices.map((notice, i) => (
            <SectionReveal key={notice.slug} delay={i * 0.1}>
              <Link
                to={`/notices/${notice.slug}`}
                className="block h-full rounded-[var(--radius-card)] border border-[var(--brand-border)] bg-[var(--brand-white)] p-6 hover:border-[var(--brand-red)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge tone={i === 0 ? 'red' : i === 1 ? 'gold' : 'green'}>{tagLabel[notice.tag]}</Badge>
                  <span className="text-xs text-[var(--brand-text-soft)]">
                    {new Date(notice.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-display mt-4 text-base font-semibold text-[var(--brand-charcoal)] leading-snug">
                  {notice.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--brand-text-soft)] leading-relaxed">{notice.excerpt}</p>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
