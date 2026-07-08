import { Camera } from 'lucide-react';
import { Container } from './ui/Container';
import { SectionHeading } from './ui/SectionHeading';
import { SectionReveal } from './ui/SectionReveal';

const tiles = [
  { caption: 'Morning Assembly', tone: 'from-[var(--brand-red)] to-[var(--brand-red-dark)]', span: 'sm:row-span-2' },
  { caption: 'Science Lab', tone: 'from-[var(--brand-charcoal)] to-[var(--brand-charcoal-700)]', span: '' },
  { caption: 'Annual Sports Week', tone: 'from-[var(--brand-green)] to-[var(--brand-green-dark)]', span: '' },
  { caption: 'Library Reading Hour', tone: 'from-[var(--brand-gold)] to-[var(--brand-gold-dark)]', span: '' },
  { caption: 'Art & Music Club', tone: 'from-[var(--brand-charcoal-700)] to-[var(--brand-charcoal)]', span: '' },
];

export function CampusLife() {
  return (
    <section id="campus-life" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Campus Life"
          title="A day here looks like this"
          subtitle="Assemblies, lab sessions, sports week, and the quiet hour in the library — glimpses from around campus."
        />

        <div id="gallery" className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:auto-rows-[160px]">
          {tiles.map((tile, i) => (
            <SectionReveal key={tile.caption} delay={i * 0.06} className={tile.span}>
              <div
                className={`relative h-full min-h-[160px] rounded-[var(--radius-card)] bg-gradient-to-br ${tile.tone} flex items-center justify-center text-white/50 overflow-hidden`}
              >
                <Camera className="h-6 w-6" />
                <span className="absolute bottom-3 left-4 text-xs font-semibold text-white/90">{tile.caption}</span>
              </div>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
