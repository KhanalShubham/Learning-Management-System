import { usePublicSiteInfo } from '../../hooks/usePublicSiteInfo';
import { cn } from '@/utils/cn';

export function SchoolMark({ className }: { className?: string }) {
  const { data: site } = usePublicSiteInfo();

  if (site?.logoUrl) {
    return (
      <img
        src={site.logoUrl}
        alt={site.schoolName}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'rounded-full bg-[var(--brand-red)] flex items-center justify-center text-white font-display font-semibold',
        className
      )}
    >
      {(site?.schoolName ?? 'D').charAt(0)}
    </span>
  );
}
