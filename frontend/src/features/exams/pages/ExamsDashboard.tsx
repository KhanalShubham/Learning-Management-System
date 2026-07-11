import { CalendarDays, FileSpreadsheet, Plus, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/common/StatsCard';
import { useExamTerms } from '../hooks/useExams';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ExamsDashboard() {
  const navigate = useNavigate();
  const { data: terms, isLoading } = useExamTerms();

  const totalTerms = terms?.length ?? 0;
  const publishedTerms = terms?.filter((t) => t.status === 'PUBLISHED').length ?? 0;
  const draftTerms = totalTerms - publishedTerms;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Engine</h1>
          <p className="text-gray-500 text-sm">Configure terminal examination cycles, build subject timetables, compile GPA results, and review merit report cards.</p>
        </div>
      </div>

      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Terminal Exam Cycles"
          value={totalTerms}
          change="Registered Terms"
          changeType="neutral"
          icon="CalendarDays"
          description="Active terms"
          colorName="blue"
        />
        <StatsCard
          title="Published Results"
          value={publishedTerms}
          change="Released Term GPAs"
          changeType="neutral"
          icon="Award"
          description="Visible to portal"
          colorName="emerald"
        />
        <StatsCard
          title="Pending Term Drafts"
          value={draftTerms}
          change="Under review"
          changeType="neutral"
          icon="ShieldAlert"
          description="Awaiting release"
          colorName="amber"
        />
        <StatsCard
          title="CDC Grading Scale"
          value="4.0 GPA"
          change="CDC standard"
          changeType="neutral"
          icon="TrendingUp"
          description="9 Bands active"
          colorName="violet"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Management Actions</CardTitle>
          <CardDescription>Launch administrative workflows immediately</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col justify-center items-center gap-2 text-blue-600 hover:text-blue-700"
            onClick={() => navigate('/dashboard/exams/terms')}
          >
            <Plus className="h-6 w-6" />
            <span className="font-semibold text-sm">Manage Exam Terms</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col justify-center items-center gap-2 text-violet-600 hover:text-violet-700"
            onClick={() => navigate('/dashboard/exams/schedule')}
          >
            <CalendarDays className="h-6 w-6" />
            <span className="font-semibold text-sm">Schedule Subject Exams</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col justify-center items-center gap-2 text-amber-600 hover:text-amber-700"
            onClick={() => navigate('/dashboard/exams/ledger')}
          >
            <FileSpreadsheet className="h-6 w-6" />
            <span className="font-semibold text-sm">Enter Ledger Marks</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col justify-center items-center gap-2 text-emerald-600 hover:text-emerald-700"
            onClick={() => navigate('/dashboard/exams/analytics')}
          >
            <BarChart2 className="h-6 w-6" />
            <span className="font-semibold text-sm">Academic Performance</span>
          </Button>
        </CardContent>
      </Card>

      {/* Active terms grid list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Terminal Exam Cycles</CardTitle>
            <CardDescription>Term schedule periods and publication status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
              </div>
            ) : totalTerms === 0 ? (
              <EmptyState
                title="No Exam Terms Scheduled"
                description="Create terminal cycles like First Term, Mid-Terms, or Finals to begin schedules."
                icon={CalendarDays}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {terms?.map((term) => (
                  <div key={term.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-base">{term.name}</h4>
                      <p className="text-sm text-gray-500">
                        Period: {term.startDate} to {term.endDate} | Weight: {term.weightage * 100}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          term.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {term.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/dashboard/exams/schedule?termId=${term.id}`)}
                      >
                        View Schedules
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Grading System Legend</CardTitle>
            <CardDescription>CDC Nepal Standard Grading Scale reference</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="font-semibold text-gray-700">Percentage Band</span>
                <span className="font-semibold text-gray-700">Letter Grade (GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">90% and above</span>
                <span className="font-semibold text-emerald-600">A+ (4.0 GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">80% to 89.9%</span>
                <span className="font-semibold text-emerald-500">A (3.6 GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">70% to 79.9%</span>
                <span className="font-semibold text-blue-600">B+ (3.2 GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">60% to 69.9%</span>
                <span className="font-semibold text-blue-500">B (2.8 GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">50% to 59.9%</span>
                <span className="font-semibold text-yellow-600">C+ (2.4 GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">40% to 49.9%</span>
                <span className="font-semibold text-yellow-500">C (2.0 GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">35% to 39.9%</span>
                <span className="font-semibold text-orange-500">D (1.6 GP)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Below 35% (Fail)</span>
                <span className="font-semibold text-rose-600">NG (0.0 GP)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
