import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbProps {
  customLabels?: Record<string, string>;
  className?: string;
}

export const Breadcrumb = ({ customLabels = {}, className }: BreadcrumbProps) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const defaultLabels: Record<string, string> = {
    students: 'Students Directory',
    teachers: 'Teachers Directory',
    settings: 'System Settings',
    ...customLabels,
  };

  return (
    <nav className={cn('flex items-center space-x-1.5 text-xs text-muted-foreground font-medium', className)} aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors py-1 px-1.5 rounded hover:bg-secondary/60"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const rawLabel = defaultLabels[value] || value;
        // Capitalize raw values
        const label = typeof rawLabel === 'string'
          ? rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)
          : rawLabel;

        return (
          <div key={to} className="flex items-center space-x-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            {isLast ? (
              <span className="text-foreground font-bold px-1.5 select-none" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-foreground transition-colors py-1 px-1.5 rounded hover:bg-secondary/60"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
