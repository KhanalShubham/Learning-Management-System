import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUIStore } from '@/store';
import { motion } from 'framer-motion';

export const ChartCard = () => {
  const simulatedRole = useUIStore((state) => state.simulatedRole);

  const configs = {
    admin: {
      title: 'Fee Collections & Expenses',
      description: 'Monthly financial cashflow tracking',
      points: [15, 30, 24, 45, 35, 60, 52, 75, 65, 80],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      color: 'var(--color-primary)',
      fillColor: 'rgba(59, 130, 246, 0.08)',
    },
    teacher: {
      title: 'Average Attendance Performance',
      description: 'Historical percentage rate across classes',
      points: [90, 92, 88, 94, 91, 95, 93, 96, 94, 97],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      color: 'var(--color-success)',
      fillColor: 'rgba(16, 185, 129, 0.08)',
    },
    student: {
      title: 'Academic Performance Trends',
      description: 'GPA average scores across semester examinations',
      points: [60, 65, 55, 70, 75, 82, 80, 88, 85, 92],
      labels: ['Unit 1', 'Unit 2', 'Quarter 1', 'Mid-Term', 'Unit 3', 'Unit 4', 'Quarter 2', 'Pre-Board', 'Finals', 'Board'],
      color: 'var(--color-info)',
      fillColor: 'rgba(14, 165, 233, 0.08)',
    },
  }[simulatedRole];

  // Map configs to coordinate coordinates
  const height = 160;
  const width = 500;
  const padding = 20;

  const minVal = Math.min(...configs.points) - 5;
  const maxVal = Math.max(...configs.points) + 5;
  const valRange = maxVal - minVal;

  const pointsCount = configs.points.length;
  const xCoords = configs.points.map((_, i) => padding + (i * (width - padding * 2)) / (pointsCount - 1));
  const yCoords = configs.points.map((val) => height - padding - ((val - minVal) * (height - padding * 2)) / valRange);

  // Generate SVG paths
  const linePath = yCoords.map((y, i) => `${i === 0 ? 'M' : 'L'} ${xCoords[i]} ${y}`).join(' ');
  const areaPath = `${linePath} L ${xCoords[xCoords.length - 1]} ${height - padding} L ${xCoords[0]} ${height - padding} Z`;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>{configs.title}</CardTitle>
        <CardDescription>{configs.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative w-full h-[180px] select-none flex flex-col justify-end">
          {/* Vector Chart SVG */}
          <svg className="w-full h-[160px] overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + ratio * (height - padding * 2);
              return (
                <line
                  key={`grid-${index}`}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="opacity-40"
                />
              );
            })}

            {/* Path Area */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              d={areaPath}
              fill={configs.fillColor}
            />

            {/* Line Graph */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              d={linePath}
              fill="none"
              stroke={configs.color}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Dots along graph path */}
            {xCoords.map((x, i) => (
              <motion.circle
                key={`dot-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 + 0.5 }}
                cx={x}
                cy={yCoords[i]}
                r="4.5"
                fill="var(--color-card)"
                stroke={configs.color}
                strokeWidth="2.5"
                className="cursor-pointer hover:r-6 hover:stroke-width-3 transition-all"
              />
            ))}
          </svg>

          {/* Bottom X Labels */}
          <div className="flex justify-between px-[20px] text-[10px] text-muted-foreground font-semibold mt-1">
            {configs.labels.map((lbl, idx) => (
              <span key={`lbl-${idx}`} className="w-10 text-center truncate">
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ChartCard;
