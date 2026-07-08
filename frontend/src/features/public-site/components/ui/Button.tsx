import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onClick'> {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  to?: string;
  href?: string;
  onClick?: () => void;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)] shadow-[var(--shadow-md)]',
  secondary:
    'bg-[var(--brand-charcoal)] text-white hover:bg-[var(--brand-charcoal-700)]',
  outline:
    'bg-transparent text-[var(--brand-charcoal)] border border-[var(--brand-border)] hover:bg-[var(--brand-surface)]',
  ghost: 'bg-transparent text-[var(--brand-charcoal)] hover:bg-[var(--brand-surface)]',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 py-3 text-sm font-semibold transition-all duration-[var(--duration-standard)] active:scale-[0.98]';

export function Button({ children, variant = 'primary', className, to, href, onClick, ...rest }: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], className);

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" {...rest} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
