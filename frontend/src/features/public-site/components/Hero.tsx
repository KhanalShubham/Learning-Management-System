import type { ReactNode } from 'react';
import { Camera, GraduationCap, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePublicSiteInfo } from '../hooks/usePublicSiteInfo';
import { Container } from './ui/Container';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export function Hero() {
  const { data: site } = usePublicSiteInfo();
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? undefined : { opacity: 0, y: 20 },
    animate: reduceMotion ? undefined : { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="pt-16 pb-24 sm:pt-24 sm:pb-32">
      <Container className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div {...fadeUp(0)}>
            <Badge tone="red">Admission Open</Badge>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="font-display mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--brand-charcoal)] leading-[1.1]"
          >
            {site?.schoolName ?? 'Deukhuri Public School'}
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 text-lg text-[var(--brand-text-soft)] leading-relaxed max-w-lg"
          >
            {site?.description ??
              site?.motto ??
              'Quality education that builds confident, disciplined, creative and responsible citizens.'}
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="#admissions" variant="primary">
              Apply for Admission
            </Button>
            <Button href="#campus-life" variant="outline">
              Explore Campus
            </Button>
          </motion.div>
        </div>

        <motion.div {...fadeUp(0.2)} className="relative">
          <div className="aspect-[4/5] w-full rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--brand-charcoal)] to-[var(--brand-charcoal-700)] flex flex-col items-center justify-center gap-3 text-white/60 shadow-[var(--shadow-lg)]">
            <Camera className="h-10 w-10" />
            <p className="text-sm font-medium">Campus photography coming soon</p>
          </div>

          <FloatingCard
            className="absolute -left-6 top-8 hidden sm:flex"
            icon={<Users className="h-4 w-4 text-[var(--brand-red)]" />}
            label={site ? `${site.studentCount}+ Students` : 'Students'}
          />
          <FloatingCard
            className="absolute -right-6 top-1/3 hidden sm:flex"
            icon={<GraduationCap className="h-4 w-4 text-[var(--brand-green)]" />}
            label="Experienced Faculty"
          />
          <FloatingCard
            className="absolute -left-4 bottom-8 hidden sm:flex"
            icon={<ShieldCheck className="h-4 w-4 text-[var(--brand-gold-dark)]" />}
            label="Safe Campus"
          />
          <FloatingCard
            className="absolute -right-4 bottom-24 hidden lg:flex"
            icon={<Sparkles className="h-4 w-4 text-[var(--brand-red)]" />}
            label="Established 2064"
          />
        </motion.div>
      </Container>
    </section>
  );
}

function FloatingCard({
  icon,
  label,
  className,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`glass-nav items-center gap-2 rounded-[var(--radius-control)] border border-[var(--brand-border)] px-4 py-3 shadow-[var(--shadow-md)] ${className ?? ''}`}
    >
      {icon}
      <span className="text-sm font-semibold text-[var(--brand-charcoal)]">{label}</span>
    </div>
  );
}
