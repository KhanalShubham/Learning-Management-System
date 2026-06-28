import { useState } from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Avatar = ({ className, src, alt = '', fallback = '?', size = 'md', border = false, ...props }: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg font-semibold',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full select-none bg-secondary items-center justify-center border-border',
        border && 'border-2 border-primary/20',
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
          {fallback.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
};
