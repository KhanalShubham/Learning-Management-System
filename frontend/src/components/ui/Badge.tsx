import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/85 border-transparent',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
    success: 'bg-success/15 text-success border-success/20 dark:bg-success/10 dark:border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/20 dark:bg-warning/10 dark:border-warning/30',
    destructive: 'bg-destructive/15 text-destructive border-destructive/20 dark:bg-destructive/10 dark:border-destructive/30',
    info: 'bg-info/15 text-info border-info/20 dark:bg-info/10 dark:border-info/30',
    outline: 'border border-border text-foreground bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
