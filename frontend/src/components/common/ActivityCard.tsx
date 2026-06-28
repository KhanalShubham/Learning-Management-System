import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowUpRight } from 'lucide-react';
import { useUIStore } from '@/store';
import { cn } from '@/utils/cn';

interface ActivityItem {
  id: number;
  message: string;
  time: string;
  type: string;
}

export const ActivityCard = () => {
  const simulatedRole = useUIStore((state) => state.simulatedRole);

  const logs: Record<'admin' | 'teacher' | 'student', ActivityItem[]> = {
    admin: [
      { id: 1, message: 'New student admissions form submitted - Ram Chandra', time: '5 mins ago', type: 'enrollment' },
      { id: 2, message: 'Monthly fee invoices dispatched to all classes', time: '1 hour ago', type: 'billing' },
      { id: 3, message: 'Server database backup completed successfully', time: '3 hours ago', type: 'system' },
      { id: 4, message: 'Emergency notice board announcement updated', time: '6 hours ago', type: 'announcement' },
    ],
    teacher: [
      { id: 1, message: 'Attendance report filed for Class 10 Section A', time: '15 mins ago', type: 'attendance' },
      { id: 2, message: 'Grade 11 English Term Marks uploaded', time: '2 hours ago', type: 'exam' },
      { id: 3, message: 'Staff assembly duty assignments updated', time: '4 hours ago', type: 'system' },
      { id: 4, message: 'Class syllabus outlines updated for Grade 9 Math', time: '7 hours ago', type: 'syllabus' },
    ],
    student: [
      { id: 1, message: 'Term Examination schedule published', time: '30 mins ago', type: 'exam' },
      { id: 2, message: 'Library book overdue alert - "Intro to Physics"', time: '2 hours ago', type: 'warning' },
      { id: 3, message: 'Fee invoice payment confirmed for Admission Term', time: '1 day ago', type: 'billing' },
      { id: 4, message: 'Weekly class schedule updated', time: '2 days ago', type: 'announcement' },
    ],
  };

  const currentLogs = logs[simulatedRole] || [];

  return (
    <Card className="flex flex-col h-full justify-between">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live notifications & changes tracking</CardDescription>
        </div>
        <span className="text-[10px] text-primary font-bold flex items-center gap-1 cursor-pointer hover:underline uppercase tracking-wider">
          View log <ArrowUpRight className="h-3 w-3" />
        </span>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-6 py-2 max-h-[290px] scrollbar-thin">
        {currentLogs.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">
            No recent activity logged.
          </div>
        ) : (
          <div className="relative border-l border-border/70 ml-2.5 pl-6 space-y-5 py-2">
            {currentLogs.map((log) => (
              <div key={log.id} className="relative text-xs">
                {/* Timeline node icon dot */}
                <span className={cn(
                  'absolute -left-9.5 top-0.5 w-3 h-3 rounded-full border-2 border-card ring-4 ring-card',
                  log.type === 'enrollment' || log.type === 'attendance' ? 'bg-emerald-500' :
                  log.type === 'billing' || log.type === 'exam' ? 'bg-blue-500' :
                  log.type === 'warning' ? 'bg-destructive' : 'bg-primary'
                )} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground/90 font-medium leading-relaxed">
                    {log.message}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default ActivityCard;
