import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] bg-[var(--brand-white)] border border-[var(--brand-border)] shadow-[var(--shadow-sm)] p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
