import { cn } from '@/utils/cn';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ className, size = 'md', ...props }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-primary border-r-transparent border-b-primary border-l-transparent',
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
