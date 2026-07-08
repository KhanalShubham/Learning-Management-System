import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { Container } from './ui/Container';
import { SectionReveal } from './ui/SectionReveal';

export function StatsStrip() {
  const { data: site } = usePublicSiteInfo();

  const stats = [
    { value: site ? `${site.studentCount}+` : '—', label: 'Students Enrolled' },
    { value: '96%', label: 'SEE Pass Rate' },
    { value: '1:15', label: 'Teacher-to-Student Ratio' },
    { value: '18+', label: 'Years Since Founding' },
  ];

  return (
    <section className="border-y border-[var(--brand-border)] bg-[var(--brand-white)]">
      <Container className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <SectionReveal key={stat.label} delay={i * 0.08} className="text-center sm:text-left">
            <p className="font-display text-3xl sm:text-4xl font-semibold text-[var(--brand-charcoal)]">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-[var(--brand-text-soft)]">{stat.label}</p>
          </SectionReveal>
        ))}
      </Container>
    </section>
  );
}
