import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserPlus, List } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useStudentSummary } from '../hooks/useStudentSummary';
import { useStudents } from '../hooks/useStudents';
import type { StudentStatus } from '../types';

const statusVariant = (status: StudentStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'GRADUATED':
      return 'info' as const;
    case 'INACTIVE':
    case 'WITHDRAWN':
      return 'secondary' as const;
    case 'TRANSFERRED':
      return 'warning' as const;
  }
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAdmit = !!user?.permissions.includes('students.admit') || !!user?.permissions.includes('*');

  const { data: summary, isLoading: summaryLoading } = useStudentSummary();
  const { data: recent, isLoading: recentLoading } = useStudents({ take: 5 });

  const quickActions = [
    {
      name: 'New Admission',
      description: 'Admit a new applicant',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/dashboard/students/admission'),
      visible: canAdmit,
    },
    {
      name: 'View Students',
      description: 'Browse the full registry',
      icon: List,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => navigate('/dashboard/students/list'),
      visible: true,
    },
  ].filter((action) => action.visible);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Students</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Overview of admissions and enrollment.</p>
      </div>

      {summaryLoading ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title="Total Students"
            value={summary?.total ?? 0}
            change="All-time"
            changeType="neutral"
            icon="GraduationCap"
            description="all statuses"
            colorName="blue"
          />
          <StatsCard
            title="Today's Admissions"
            value={summary?.todayAdmissions ?? 0}
            change="Today"
            changeType="neutral"
            icon="CalendarPlus"
            description="since midnight"
            colorName="emerald"
          />
          <StatsCard
            title="New This Month"
            value={summary?.newThisMonth ?? 0}
            change="Monthly"
            changeType="neutral"
            icon="TrendingUp"
            description="this month"
            colorName="violet"
          />
          <StatsCard
            title="Archived"
            value={summary?.archived ?? 0}
            change="Archived"
            changeType="neutral"
            icon="Archive"
            description="not active"
            colorName="amber"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Admissions</CardTitle>
              <CardDescription>The most recently admitted students.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="flex items-center justify-center min-h-[160px]">
                  <LoadingSpinner />
                </div>
              ) : !recent || recent.data.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No admissions yet"
                  description="Admitted students will show up here."
                  className="min-h-[160px] border-none"
                />
              ) : (
                <ul className="divide-y divide-border/40">
                  {recent.data.map((student) => {
                    const enrollment = student.enrollments[0];
                    return (
                      <li
                        key={student.id}
                        className="flex items-center justify-between py-3 cursor-pointer hover:bg-secondary/30 -mx-2 px-2 rounded-lg transition-colors"
                        onClick={() => navigate(`/dashboard/students/${student.id}`)}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{student.admissionNumber}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {enrollment ? `${enrollment.class.name} - ${enrollment.section.name}` : '—'}
                          </span>
                          <Badge variant={statusVariant(student.status)}>{student.status}</Badge>
                        </div>
                      </li>
                    );
                  })}
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
