import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { Container } from './ui/Container';
import { SectionReveal } from './ui/SectionReveal';
import { Button } from './ui/Button';

const steps = [
  { title: 'Collect the form', description: 'From the school office, or download it once online forms are live.' },
  { title: 'Meet the principal', description: 'A short conversation about the child, not a test to pass.' },
  { title: 'Confirm the seat', description: 'Submit documents and the admission fee to lock in the place.' },
];

export function Admissions() {
  const { data: site } = usePublicSiteInfo();

  return (
    <section id="admissions" className="py-24 sm:py-32 bg-[var(--brand-white)]">
      <Container>
        <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--brand-charcoal)] to-[var(--brand-charcoal-700)] px-8 py-16 sm:px-16 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Admissions Open</p>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl font-semibold max-w-2xl mx-auto leading-tight">
            Three steps to a seat at {site?.schoolName ?? 'Deukhuri Public School'}
          </h2>

          <div className="mt-14 grid sm:grid-cols-3 gap-8 text-left max-w-3xl mx-auto">
            {steps.map((step, i) => (
              <SectionReveal key={step.title} delay={i * 0.1}>
                <span className="font-display text-sm text-white/50">0{i + 1}</span>
                <h3 className="font-display mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{step.description}</p>
              </SectionReveal>
            ))}
          </div>

          <div className="mt-14">
            <Button href={site?.phone ? `tel:${site.phone}` : '#contact'} variant="primary">
              Enquire About Admission
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
