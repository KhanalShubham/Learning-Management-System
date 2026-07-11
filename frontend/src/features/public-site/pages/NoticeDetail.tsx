import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Container';
import { usePublicNotice } from '../hooks/useNotices';
import type { NoticeTag } from '../types';

const tagLabel: Record<NoticeTag, string> = {
  ADMISSIONS: 'Admissions',
  EXAMINATION: 'Examination',
  EVENT: 'Event',
  NOTICE: 'Notice',
};

export const NoticeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: notice, isLoading, isError } = usePublicNotice(slug ?? '');

  if (isError) {
    return <Navigate to="/notices" replace />;
  }

  if (isLoading || !notice) {
    return (
      <div>
        <PageHero eyebrow="Notice Board" title="Loading…" description="" crumbs={[{ label: 'Home', to: '/' }, { label: 'Notices', to: '/notices' }]} />
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow={tagLabel[notice.tag]}
        title={notice.title}
        description={new Date(notice.publishedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Notices', to: '/notices' }, { label: tagLabel[notice.tag] }]}
      />

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <div className="space-y-5 text-base text-[var(--brand-text)] leading-relaxed">
            {notice.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {notice.attachmentUrl && (
            <a
              href={notice.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors underline"
            >
              View attachment
            </a>
          )}

          <Link
            to="/notices"
            className="mt-12 flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to notice board
          </Link>
        </Container>
      </section>
    </div>
  );
};

export default NoticeDetail;
