import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, helperText, ...props }, ref) => {
    const isErrored = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 flex items-center justify-center text-muted-foreground pointer-events-none shrink-0">
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              isErrored && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 flex items-center justify-center text-muted-foreground cursor-pointer shrink-0">
              {rightIcon}
            </span>
          )}
        </div>
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

Input.displayName = 'Input';
