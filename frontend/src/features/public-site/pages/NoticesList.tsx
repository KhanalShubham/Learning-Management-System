import { Link } from 'react-router-dom';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Container';
import { Badge } from '../components/ui/Badge';
import { SectionReveal } from '../components/ui/SectionReveal';
import { usePublicNotices } from '../hooks/useNotices';
import type { NoticeTag } from '../types';

const tagTone: Record<NoticeTag, 'red' | 'gold' | 'green' | 'charcoal'> = {
  ADMISSIONS: 'red',
  EXAMINATION: 'gold',
  EVENT: 'green',
  NOTICE: 'charcoal',
};
const tagLabel: Record<NoticeTag, string> = {
  ADMISSIONS: 'Admissions',
  EXAMINATION: 'Examination',
  EVENT: 'Event',
  NOTICE: 'Notice',
};

export const NoticesList = () => {
  const { data, isLoading } = usePublicNotices();
  const notices = data?.data ?? [];

  return (
    <div>
      <PageHero
        eyebrow="Notice Board"
        title="Announcements, routines, and events"
        description="Everything posted on the school notice board, kept here so no family misses a date."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Notices' }]}
      />

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          {isLoading ? (
            <p className="text-sm text-[var(--brand-text-soft)] text-center py-12">Loading notices…</p>
          ) : notices.length === 0 ? (
            <p className="text-sm text-[var(--brand-text-soft)] text-center py-12">No notices have been posted yet.</p>
          ) : (
            <div className="divide-y divide-[var(--brand-border)] border-y border-[var(--brand-border)]">
              {notices.map((notice, i) => (
                <SectionReveal key={notice.slug} delay={i * 0.06}>
                  <Link to={`/notices/${notice.slug}`} className="block py-8 group">
                    <div className="flex items-center gap-3">
                      <Badge tone={tagTone[notice.tag]}>{tagLabel[notice.tag]}</Badge>
                      <span className="text-xs text-[var(--brand-text-soft)]">
                        {new Date(notice.publishedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="font-display mt-3 text-xl font-semibold text-[var(--brand-charcoal)] group-hover:text-[var(--brand-red)] transition-colors">
                      {notice.title}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--brand-text-soft)] leading-relaxed max-w-xl">
                      {notice.excerpt}
                    </p>
                  </Link>
                </SectionReveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default NoticesList;
