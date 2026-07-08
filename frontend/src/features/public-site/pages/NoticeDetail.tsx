import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Container';
import { notices } from '../data/notices';

export const NoticeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const notice = notices.find((n) => n.slug === slug);

  if (!notice) {
    return <Navigate to="/public/notices" replace />;
  }

  return (
    <div>
      <PageHero
        eyebrow={notice.tag}
        title={notice.title}
        description={notice.date}
        crumbs={[{ label: 'Home', to: '/public' }, { label: 'Notices', to: '/public/notices' }, { label: notice.tag }]}
      />

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <div className="space-y-5 text-base text-[var(--brand-text)] leading-relaxed">
            {notice.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <Link
            to="/public/notices"
            className="mt-12 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to notice board
          </Link>
        </Container>
      </section>
    </div>
  );
};

export default NoticeDetail;
