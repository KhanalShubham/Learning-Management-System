import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | boolean;
  options?: SelectOption[];
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, children, label, ...props }, ref) => {
    const isErrored = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors appearance-none cursor-pointer pr-10',
              isErrored && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="absolute right-3.5 flex items-center justify-center text-muted-foreground pointer-events-none shrink-0">
            <ChevronDown className="h-4.5 w-4.5" />
          </span>
        </div>
        {isErrored && typeof error === 'string' && (
          <p className="text-xs text-destructive mt-1.5 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
