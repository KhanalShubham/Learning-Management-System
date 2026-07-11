import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, List } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTeacherSummary } from '../hooks/useTeacherSummary';
import { useTeachers } from '../hooks/useTeachers';
import type { TeacherStatus } from '../types';

const statusVariant = (status: TeacherStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'ON_LEAVE':
      return 'info' as const;
    case 'SUSPENDED':
      return 'warning' as const;
    case 'RESIGNED':
    case 'TERMINATED':
    case 'RETIRED':
      return 'secondary' as const;
  }
};

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = !!user?.permissions.includes('teachers.create') || !!user?.permissions.includes('*');

  const { data: summary, isLoading: summaryLoading } = useTeacherSummary();
  const { data: recent, isLoading: recentLoading } = useTeachers({ take: 5 });

  const quickActions = [
    {
      name: 'Register Teacher',
      description: 'Add a new faculty member',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/dashboard/teachers/new'),
      visible: canCreate,
    },
    {
      name: 'View Teachers',
      description: 'Browse the full directory',
      icon: List,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => navigate('/dashboard/teachers/list'),
      visible: true,
    },
  ].filter((action) => action.visible);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Faculty</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Overview of teaching staff and employment status.</p>
      </div>

      {summaryLoading ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title="Total Teachers"
            value={summary?.total ?? 0}
            change="All-time"
            changeType="neutral"
            icon="Users"
            description="all statuses"
            colorName="blue"
          />
          <StatsCard
            title="Active"
            value={summary?.active ?? 0}
            change="Active"
            changeType="neutral"
            icon="UserCheck"
            description="currently teaching"
            colorName="emerald"
          />
          <StatsCard
            title="On Leave / Suspended"
            value={(summary?.onLeave ?? 0) + (summary?.suspended ?? 0)}
            change="Away"
            changeType="neutral"
            icon="UserMinus"
            description="temporarily away"
            colorName="amber"
          />
          <StatsCard
            title="Joined This Month"
            value={summary?.joinedThisMonth ?? 0}
            change="Monthly"
            changeType="neutral"
            icon="TrendingUp"
            description="new hires"
            colorName="violet"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recently Joined</CardTitle>
              <CardDescription>The most recently registered teachers.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="flex items-center justify-center min-h-[160px]">
                  <LoadingSpinner />
                </div>
              ) : !recent || recent.data.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No teachers yet"
                  description="Registered teachers will show up here."
                  className="min-h-[160px] border-none"
                />
              ) : (
                <ul className="divide-y divide-border/40">
                  {recent.data.map((teacher) => (
                    <li
                      key={teacher.id}
                      className="flex items-center justify-between py-3 cursor-pointer hover:bg-secondary/30 -mx-2 px-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/dashboard/teachers/${teacher.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {[teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(' ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{teacher.employeeId}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:inline">{teacher.department.name}</span>
                        <Badge variant={statusVariant(teacher.status)}>{teacher.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Shortcuts for common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.onClick}
                  className="group w-full p-4 bg-secondary/30 border border-border/60 hover:bg-secondary/70 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer active:scale-98"
                >
                  <div className={`p-2.5 rounded-lg text-white shrink-0 ${action.color} group-hover:scale-105 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-foreground truncate">{action.name}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{action.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
