import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Container';
import { SectionReveal } from '../components/ui/SectionReveal';
import { teachers } from '../data/teachers';

export const FacultyDirectory = () => {
  return (
    <div>
      <PageHero
        eyebrow="Our Faculty"
        title="The teachers behind every classroom"
        description="Twenty-four teachers across four departments. Here are a few of the people your child will learn from."
        crumbs={[{ label: 'Home', to: '/public' }, { label: 'Faculty' }]}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, i) => (
            <SectionReveal key={teacher.slug} delay={i * 0.05}>
              <Link
                to={`/public/faculty/${teacher.slug}`}
                className="group block h-full rounded-[var(--radius-card)] border border-[var(--brand-border)] bg-[var(--brand-white)] p-6 hover:border-[var(--brand-red)] transition-colors"
              >
                <div className="h-16 w-16 rounded-full bg-[var(--brand-surface)] flex items-center justify-center overflow-hidden">
                  {teacher.photoUrl ? (
                    <img src={teacher.photoUrl} alt={teacher.name} className="h-full w-full object-cover" />
                  ) : (
                    <GraduationCap className="h-6 w-6 text-[var(--brand-text-soft)]" />
                  )}
                </div>
                <h2 className="font-display mt-4 text-base font-semibold text-[var(--brand-charcoal)] group-hover:text-[var(--brand-red)] transition-colors">
                  {teacher.name}
                </h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-soft)]">
                  {teacher.role}
                </p>
                <p className="mt-3 text-sm text-[var(--brand-text-soft)]">{teacher.department}</p>
              </Link>
            </SectionReveal>
          ))}
        </Container>
      </section>
    </div>
  );
};

export default FacultyDirectory;
