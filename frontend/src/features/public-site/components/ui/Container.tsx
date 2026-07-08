import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('max-w-7xl mx-auto px-6 lg:px-8', className)}>{children}</div>;
}
