import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'red' | 'green' | 'gold' | 'charcoal';

const toneClasses: Record<Tone, string> = {
  red: 'bg-[var(--brand-red-light)] text-[var(--brand-red-dark)]',
  green: 'bg-[var(--brand-green-light)] text-[var(--brand-green-dark)]',
  gold: 'bg-[var(--brand-gold-light)] text-[var(--brand-gold-dark)]',
  charcoal: 'bg-[var(--brand-surface)] text-[var(--brand-charcoal-700)]',
};

export function Badge({
  children,
  tone = 'charcoal',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
