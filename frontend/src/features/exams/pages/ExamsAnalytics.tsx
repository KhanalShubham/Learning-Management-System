import { useState } from 'react';
import { BarChart3, TrendingUp, Users, AlertCircle, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useExamTerms, useTermReportCards } from '../hooks/useExams';

export default function ExamsAnalytics() {
  const { data: terms } = useExamTerms();

  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const activeTerm = terms?.find((t) => t.id === selectedTermId);
  const { data: classes } = useClasses(activeTerm?.academicYearId);

  // Fetch report cards for this term & class
  const { data: cards, isLoading: cardsLoading } = useTermReportCards(
    selectedTermId,
    selectedClassId || undefined
  );

  // Diagnostic calculations
  const totalStudents = cards?.length ?? 0;
  const passCount = cards?.filter((c) => c.resultStatus === 'PASS').length ?? 0;
  const passRate = totalStudents > 0 ? parseFloat(((passCount / totalStudents) * 100).toFixed(1)) : 0;

  const gpas = cards?.map((c) => c.gpa) ?? [];
  const highestGpa = gpas.length > 0 ? Math.max(...gpas) : 0.0;
  const averageGpa =
    gpas.length > 0
      ? parseFloat((gpas.reduce((acc, curr) => acc + curr, 0) / gpas.length).toFixed(2))
      : 0.0;

  // Grade distributions count
  const bands = {
    'A+ (3.6 - 4.0)': cards?.filter((c) => c.gpa >= 3.6 && c.resultStatus === 'PASS').length ?? 0,
    'A (3.2 - 3.59)': cards?.filter((c) => c.gpa >= 3.2 && c.gpa < 3.6 && c.resultStatus === 'PASS').length ?? 0,
    'B+ (2.8 - 3.19)': cards?.filter((c) => c.gpa >= 2.8 && c.gpa < 3.2 && c.resultStatus === 'PASS').length ?? 0,
    'B (2.4 - 2.79)': cards?.filter((c) => c.gpa >= 2.4 && c.gpa < 2.8 && c.resultStatus === 'PASS').length ?? 0,
    'C+ (2.0 - 2.39)': cards?.filter((c) => c.gpa >= 2.0 && c.gpa < 2.4 && c.resultStatus === 'PASS').length ?? 0,
    'D/C (1.6 - 1.99)': cards?.filter((c) => c.gpa >= 1.6 && c.gpa < 2.0 && c.resultStatus === 'PASS').length ?? 0,
    'NG (Fail)': cards?.filter((c) => c.resultStatus === 'FAIL').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Analytics & Merit Lists</h1>
        <p className="text-gray-500 text-sm">Analyze terminal class-wide results distributions and positions.</p>
      </div>

      {/* Selectors */}
      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam Term</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedTermId}
            onChange={(e) => {
              setSelectedTermId(e.target.value);
              setSelectedClassId('');
            }}
          >
            <option value="">-- Choose Exam Term --</option>
            {terms?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class Tier</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={!selectedTermId}
          >
            <option value="">-- Choose Class --</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedClassId ? (
        <div className="p-8 border rounded-lg bg-white text-center text-gray-500">
          Please select both an exam term and class tier to load the dashboard analysis diagnostics.
        </div>
      ) : cardsLoading ? (
        <div className="flex justify-center p-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
        </div>
      ) : !cards || cards.length === 0 ? (
        <div className="p-8 border rounded-lg bg-white text-center text-rose-600 flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <span className="font-semibold text-lg">No Results Available</span>
          <p className="text-sm text-gray-500">
            Report cards for this class/term have not been calculated yet. Verify that this term is
            published in the Term Manager.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Performance stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-lg text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Enrolled Roster
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents} Students</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-lg text-white">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Pass Percentage
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{passRate}% Pass Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-violet-500 rounded-lg text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
                    Class Highest GPA
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{highestGpa.toFixed(2)} GPA</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-500 rounded-lg text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Class Average GPA
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{averageGpa.toFixed(2)} GPA</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Merit list table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Academic Merit Ranks List</CardTitle>
                <CardDescription>Rankings compiled in descending GPA order</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">GPA</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-extrabold text-gray-900 text-sm">
                          {card.classRank ?? '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-800">
                          {card.student?.firstName} {card.student?.lastName}
                        </TableCell>
                        <TableCell className="text-center font-bold text-blue-700">
                          {card.gpa.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">{card.percentage}%</TableCell>
                        <TableCell className="font-medium text-gray-700">
                          {card.division || 'Fail'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              card.resultStatus === 'PASS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}
                          >
                            {card.resultStatus}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Distributions stats layout */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Bands Dispersion</CardTitle>
                <CardDescription>Number of students inside each GPA band</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(bands).map(([band, count]) => {
                    const pct = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                    return (
                      <div key={band} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-700">{band}</span>
                          <span className="text-gray-500">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              band.includes('Fail') || band.includes('NG') ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
