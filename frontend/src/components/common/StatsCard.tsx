import { Card } from '@/components/ui/Card';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  description?: string;
  colorName?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'sky';
}

const colorConfigs = {
  blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  violet: 'text-violet-600 bg-violet-50 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30',
  amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
  rose: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
  sky: 'text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30',
};

export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  description = 'vs last month',
  colorName = 'blue',
}: StatsCardProps) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] || Icons.HelpCircle;
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  // Generate a mock sparkline path
  const mockPath = isPositive
    ? 'M 5 35 Q 25 30, 45 40 T 85 20 T 125 10 T 165 25 T 195 5'
    : isNegative
    ? 'M 5 5 Q 25 15, 45 10 T 85 30 T 125 25 T 165 35 T 195 38'
    : 'M 5 20 Q 25 22, 45 20 T 85 21 T 125 19 T 165 20 T 195 20';

  return (
    <Card hoverEffect className="p-5 flex flex-col justify-between h-40 relative overflow-hidden select-none">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={cn('p-2.5 rounded-lg border shrink-0', colorConfigs[colorName])}>
          <IconComponent className="h-5 w-5" />
        </div>
      </div>

      {/* Value row */}
      <div className="mt-2 flex items-baseline justify-between z-10">
        <div>
          <span className="text-2xl font-extrabold tracking-tight text-foreground">{value}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={cn(
                'text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                isPositive && 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20',
                isNegative && 'text-rose-600 bg-rose-50 dark:bg-rose-950/20',
                !isPositive && !isNegative && 'text-muted-foreground bg-secondary'
              )}
            >
              {change}
            </span>
            <span className="text-[10px] text-muted-foreground">{description}</span>
          </div>
        </div>

        {/* Small Premium Sparkline SVG */}
        <div className="w-24 h-10 overflow-visible opacity-45 hover:opacity-85 transition-opacity duration-200">
          <svg className="w-full h-full" viewBox="0 0 200 40">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              d={mockPath}
              fill="none"
              stroke={
                isPositive
                  ? 'var(--color-success)'
                  : isNegative
                  ? 'var(--color-destructive)'
                  : 'var(--color-neutral)'
              }
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
};
export default StatsCard;
