import { BookOpen, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Container } from './ui/Container';
import { SectionHeading } from './ui/SectionHeading';
import { SectionReveal } from './ui/SectionReveal';
import { Card } from './ui/Card';

const pillars = [
  {
    icon: BookOpen,
    title: 'A curriculum that builds up',
    description: 'Nursery through Grade 10, mapped so what a child learns this year is the foundation for the next.',
  },
  {
    icon: HeartHandshake,
    title: 'Teachers who stay close',
    description: 'Small class sizes mean every teacher knows a student’s name, strengths, and where they’re stuck.',
  },
  {
    icon: ShieldCheck,
    title: 'A campus parents trust',
    description: 'Supervised gates, a resident nurse, and a transport fleet tracked from pickup to drop-off.',
  },
];

export function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Why Deukhuri"
          title="Everything a family needs, in one campus"
          subtitle="We built Deukhuri around a simple idea: education works best when parents, teachers, and students are never guessing what's happening next."
        />

        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <SectionReveal key={pillar.title} delay={i * 0.1}>
              <Card className="h-full">
                <div className="h-12 w-12 rounded-[var(--radius-control)] bg-[var(--brand-red-light)] flex items-center justify-center">
                  <pillar.icon className="h-6 w-6 text-[var(--brand-red)]" />
                </div>
                <h3 className="font-display mt-6 text-lg font-semibold text-[var(--brand-charcoal)]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--brand-text-soft)] leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            </SectionReveal>
          ))}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          <SectionReveal>
            <PanelCard
              tone="charcoal"
              eyebrow="For Parents"
              title="A teacher you can actually reach"
              description="Scheduled parent-teacher meetings every term, plus a class teacher who returns a call the same day — not an automated help desk."
            />
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <PanelCard
              tone="red"
              eyebrow="For Students"
              title="A classroom that meets them where they are"
              description="Extra-curriculars, remedial support, and a library open before and after class hours — school is more than the last bell."
            />
          </SectionReveal>
        </div>
      </Container>
    </section>
  );
}

function PanelCard({
  tone,
  eyebrow,
  title,
  description,
}: {
  tone: 'charcoal' | 'red';
  eyebrow: string;
  title: string;
  description: string;
}) {
  const bg =
    tone === 'charcoal'
      ? 'bg-gradient-to-br from-[var(--brand-charcoal)] to-[var(--brand-charcoal-700)]'
      : 'bg-gradient-to-br from-[var(--brand-red)] to-[var(--brand-red-dark)]';

  return (
    <div className={`rounded-[var(--radius-card)] p-10 text-white ${bg}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">{eyebrow}</p>
      <h3 className="font-display mt-3 text-2xl font-semibold leading-snug">{title}</h3>
      <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-md">{description}</p>
    </div>
  );
}
