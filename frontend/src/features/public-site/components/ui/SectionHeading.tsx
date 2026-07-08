import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--brand-charcoal)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-[var(--brand-text-soft)] leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
