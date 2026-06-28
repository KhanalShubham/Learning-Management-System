import { cn } from '@/utils/cn';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-secondary/80 dark:bg-secondary/40', className)}
      {...props}
    />
  );
};
