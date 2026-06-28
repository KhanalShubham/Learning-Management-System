import { useState } from 'react';
import { useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { WelcomeCard } from '@/components/common/WelcomeCard';
import { StatsCard } from '@/components/common/StatsCard';
import { ChartCard } from '@/components/common/ChartCard';
import { QuickActionCard } from '@/components/common/QuickActionCard';
import { ActivityCard } from '@/components/common/ActivityCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Eye, Info } from 'lucide-react';

export default function Dashboard() {
  const simulatedRole = useUIStore((state) => state.simulatedRole);
  const { toast } = useToast();

  // Showcase UI toggles
  const [showcaseModal, setShowcaseModal] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  const stats = {
    admin: [
      { title: 'Total Enrolled Students', value: '1,248', change: '+4.3%', changeType: 'positive' as const, icon: 'GraduationCap', color: 'blue' as const },
      { title: 'Academic Faculty Staff', value: '86', change: '+2.1%', changeType: 'positive' as const, icon: 'Users', color: 'emerald' as const },
      { title: 'Monthly Bill Collections', value: 'रू 24,500', change: '+12.4%', changeType: 'positive' as const, icon: 'DollarSign', color: 'violet' as const },
      { title: 'Active Attendance Rate', value: '94.2%', change: '-0.8%', changeType: 'negative' as const, icon: 'Activity', color: 'amber' as const },
    ],
    teacher: [
      { title: 'My Lectures Scheduled', value: '4 Classes', change: '8 hrs/week', changeType: 'neutral' as const, icon: 'CalendarDays', color: 'emerald' as const },
      { title: 'Students Supervised', value: '185', change: 'Grade 9 & 10', changeType: 'neutral' as const, icon: 'GraduationCap', color: 'blue' as const },
      { title: 'Syllabus Complete Ratio', value: '72%', change: '+4.5%', changeType: 'positive' as const, icon: 'FileCheck', color: 'violet' as const },
      { title: 'Grade Book Pending Log', value: '3 Exams', change: 'Action needed', changeType: 'negative' as const, icon: 'FileSpreadsheet', color: 'amber' as const },
    ],
    student: [
      { title: 'Registered Classes', value: '6 Courses', change: 'Term 2', changeType: 'neutral' as const, icon: 'BookOpen', color: 'sky' as const },
      { title: 'Term Attendance Average', value: '96.5%', change: '+1.2%', changeType: 'positive' as const, icon: 'Activity', color: 'emerald' as const },
      { title: 'Semester Grade Average', value: '3.62 GPA', change: '+0.15', changeType: 'positive' as const, icon: 'FileSpreadsheet', color: 'violet' as const },
      { title: 'Library Checked Books', value: '2 Overdue', change: 'Due in 3 days', changeType: 'negative' as const, icon: 'CalendarDays', color: 'amber' as const },
    ],
  }[simulatedRole] || [];

  const triggerLoaderShowcase = () => {
    setLoadingState(true);
    toast({ title: 'Loading Started', description: 'Testing skeleton loaders placeholder state...', variant: 'info' });
    setTimeout(() => {
      setLoadingState(false);
      toast({ title: 'Loading Completed', description: 'Real data restored to UI panel view', variant: 'success' });
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none pb-12 animate-in fade-in duration-300">
      {/* 1. Welcomer Banner */}
      <WelcomeCard />

      {/* 2. Responsive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <StatsCard
            key={`${simulatedRole}-stat-${i}`}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            colorName={stat.color}
          />
        ))}
      </div>

      {/* 3. Main Split Widgets Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left column (2/3 width) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Custom SVG Line Chart */}
          <ChartCard />

          {/* Quick Actions Shortcuts */}
          <QuickActionCard />
        </div>

        {/* Right column (1/3 width) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Timeline Activity card */}
          <ActivityCard />

          {/* Design System Playground Showcase */}
          <Card className="border-primary/10">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Design Showcase</CardTitle>
              </div>
              <CardDescription>Verify all customized UI system assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4.5 pt-4 text-xs font-semibold">
              {/* Badge components */}
              <div className="space-y-2">
                <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">
                  Badge Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="default">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              {/* Alert notifications */}
              <div className="space-y-2">
                <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">
                  Alert Banners
                </span>
                <Alert variant="info" title="Dev Notification" className="py-2.5 px-3">
                  This page has sandbox state prefill capabilities.
                </Alert>
              </div>

              {/* Button Triggers */}
              <div className="space-y-2">
                <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">
                  Action Dialogs
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => setShowcaseModal(true)}
                  >
                    View Modal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Info className="h-3.5 w-3.5" />}
                    onClick={triggerLoaderShowcase}
                  >
                    Load Skeletons
                  </Button>
                </div>
              </div>

              {/* Toast Trigger */}
              <div className="space-y-2">
                <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">
                  Toast Notification
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    className="w-full text-[10px]"
                    onClick={() => toast({ title: 'Success', description: 'Action recorded successfully', variant: 'success' })}
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-[10px]"
                    onClick={() => toast({ title: 'System Warning', description: 'Resource threshold alert active', variant: 'destructive' })}
                  >
                    Error Toast
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SHOWCASE PLAYGROUND MODAL */}
      <Modal isOpen={showcaseModal} onClose={() => setShowcaseModal(false)} title="Design System UI Playground">
        {loadingState ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify the empty list fallback displays and loading spinners below:
            </p>
            <EmptyState
              title="No Pending Academic Approvals"
              description="Everything is current. Registered curriculum directories match catalog requirements."
              actionLabel="Mock Action Refresh"
              onAction={() => toast({ title: 'Success', description: 'Refreshed approval indices', variant: 'success' })}
              className="py-6 border-dashed"
            />
            <div className="flex justify-end pt-2 border-t border-border/40">
              <Button variant="default" onClick={() => setShowcaseModal(false)}>
                Close Showcase
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
