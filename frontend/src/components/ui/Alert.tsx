import { useState } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
}

export const Alert = ({
  className,
  variant = 'default',
  title,
  children,
  onClose,
  ...props
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const iconMap = {
    default: Info,
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    destructive: AlertCircle,
  };

  const Icon = iconMap[variant];

  const variants = {
    default: 'bg-secondary text-foreground border-border',
    info: 'bg-info/10 text-info border-info/20 dark:border-info/30',
    success: 'bg-success/10 text-success border-success/20 dark:border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/20 dark:border-warning/30',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20 dark:border-destructive/30',
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-xl border p-4 flex gap-3 text-sm transition-all shadow-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex shrink-0 items-start pt-0.5">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-bold leading-none tracking-tight text-foreground">{title}</h5>}
        {children && <div className="text-xs opacity-90 leading-normal">{children}</div>}
      </div>
      {onClose && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
