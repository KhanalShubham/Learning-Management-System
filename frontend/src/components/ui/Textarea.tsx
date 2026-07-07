import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, rows = 3, ...props }, ref) => {
    const isErrored = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none',
            isErrored && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {isErrored && typeof error === 'string' && (
          <p className="text-xs text-destructive mt-1.5 font-medium">{error}</p>
        )}
        {!isErrored && helperText && (
          <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
