import { Button } from './Button';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  className,
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  ...props
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-xl bg-card/30 min-h-[300px] animate-in fade-in duration-300',
        className
      )}
      {...props}
    >
      <div className="p-4 bg-secondary/50 rounded-full text-muted-foreground/60 mb-4 shrink-0">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="font-bold text-base text-foreground leading-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
