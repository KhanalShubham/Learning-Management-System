import { Link, Navigate, useParams } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Badge } from '../components/ui/Badge';
import { SectionReveal } from '../components/ui/SectionReveal';
import { teachers } from '../data/teachers';

export const FacultyProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const teacher = teachers.find((t) => t.slug === slug);

  if (!teacher) {
    return <Navigate to="/public/faculty" replace />;
  }

  const colleagues = teachers.filter((t) => t.department === teacher.department && t.slug !== teacher.slug);

  return (
    <div>
      <section className="bg-[var(--brand-surface)] border-b border-[var(--brand-border)] py-16 sm:py-20">
        <Container>
          <nav className="text-xs text-[var(--brand-text-soft)] mb-6" aria-label="Breadcrumb">
            <Link to="/public" className="hover:text-[var(--brand-charcoal)] transition-colors">
              Home
            </Link>
            {' / '}
            <Link to="/public/faculty" className="hover:text-[var(--brand-charcoal)] transition-colors">
              Faculty
            </Link>
            {' / '}
            <span className="text-[var(--brand-charcoal)] font-medium">{teacher.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-[var(--brand-white)] border border-[var(--brand-border)] shadow-[var(--shadow-md)] flex items-center justify-center overflow-hidden shrink-0">
              {teacher.photoUrl ? (
                <img src={teacher.photoUrl} alt={teacher.name} className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-8 w-8 text-[var(--brand-text-soft)]" />
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-[var(--brand-charcoal)]">{teacher.name}</h1>
              <p className="mt-1 text-sm text-[var(--brand-text-soft)]">
                {teacher.role} · {teacher.department}
              </p>
              <div className="mt-3">
                <Badge tone="red">{teacher.experienceYears} Years Teaching</Badge>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid lg:grid-cols-[1fr_260px] gap-16">
          <SectionReveal>
            <h2 className="font-display text-xl font-semibold text-[var(--brand-charcoal)]">About</h2>
            <p className="mt-4 text-base text-[var(--brand-text)] leading-relaxed max-w-xl">{teacher.bio}</p>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h2 className="font-display text-base font-semibold text-[var(--brand-charcoal)]">Subjects Taught</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {teacher.subjects.map((subject) => (
                <span
                  key={subject}
                  className="rounded-[var(--radius-pill)] bg-[var(--brand-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-charcoal-700)]"
                >
                  {subject}
                </span>
              ))}
            </div>
          </SectionReveal>
        </Container>

        {colleagues.length > 0 && (
          <Container className="mt-16">
            <h2 className="font-display text-base font-semibold text-[var(--brand-charcoal)]">
              Also in {teacher.department}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {colleagues.map((colleague) => (
                <Link
                  key={colleague.slug}
                  to={`/public/faculty/${colleague.slug}`}
                  className="rounded-[var(--radius-pill)] border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-charcoal)] hover:border-[var(--brand-red)] transition-colors"
                >
                  {colleague.name}
                </Link>
              ))}
            </div>
          </Container>
        )}

        <Container className="mt-10">
          <Link
            to="/public/faculty"
            className="text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] transition-colors"
          >
            ← Back to faculty directory
          </Link>
        </Container>
      </section>
    </div>
  );
};

export default FacultyProfile;
