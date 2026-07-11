/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/services/api';
import { useAcademicYears } from '@/features/school/hooks/useAcademicYears';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useSections } from '@/features/academic-structure/hooks/useSections';
import { useStudentMonthly, useTeacherMonthly } from '../hooks/useAttendance';

const MONTHS_LIST = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' },
];

export default function MonthlyRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Determine type from url parameter
  const typeParam = searchParams.get('type') === 'teacher' ? 'teacher' : 'student';
  const [isStudent, setIsStudent] = useState(typeParam === 'student');

  useEffect(() => {
    setIsStudent(typeParam === 'student');
  }, [typeParam]);

  const canViewTeacher = !!user?.permissions.includes('attendance.teacher.view') || !!user?.permissions.includes('*');

  // Month & Year states
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Student specific filters
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // 1. Fetch academic years, classes, sections
  const { data: years } = useAcademicYears();
  const { data: classes } = useClasses(selectedYear);
  const { data: sections } = useSections(selectedClass);

  useEffect(() => {
    if (years && years.length > 0 && !selectedYear) {
      const current = years.find((y) => y.isCurrent);
      if (current) setSelectedYear(current.id);
      else setSelectedYear(years[0].id);
    }
  }, [years, selectedYear]);

  // 2. Fetch monthly register data
  const { data: studentRegister, isLoading: studentLoading } = useStudentMonthly(
    selectedYear,
    selectedClass,
    selectedSection,
    month,
    year
  );

  const { data: teacherRegister, isLoading: teacherLoading } = useTeacherMonthly(
    month,
    year
  );

  // Derive days count in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Trigger file download using Bearer Token
  const handleExportCSV = async () => {
    if (isStudent && (!selectedYear || !selectedClass || !selectedSection)) {
      toast({ title: 'Please select grade class and section filters first.', variant: 'warning' });
      return;
    }
    try {
      const endpoint = isStudent ? '/attendance/students/register/export' : '/attendance/teachers/register/export';
      const params = isStudent
        ? { academicYearId: selectedYear, classId: selectedClass, sectionId: selectedSection, month, year }
        : { month, year };

      const response = await api.get(endpoint, {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${isStudent ? 'student' : 'teacher'}-attendance-register-${year}-${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: 'CSV Register exported successfully.', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    }
  };

  const showStudents = isStudent;
  const isLoading = showStudents ? studentLoading : teacherLoading;
  const registerData = showStudents ? studentRegister : teacherRegister;

  const handleToggleType = () => {
    if (!isStudent && !canViewTeacher) return;
    navigate(`/dashboard/attendance/register?type=${isStudent ? 'teacher' : 'student'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/attendance')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Monthly Attendance Register</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Spreadsheet-style registry layout.</p>
          </div>
        </div>
        {canViewTeacher && (
          <Button variant="outline" size="sm" onClick={handleToggleType}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Switch to {isStudent ? 'Teacher Register' : 'Student Register'}
          </Button>
        )}
      </div>

      {/* Filter Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            {isStudent && (
              <>
                <div className="w-48">
                  <label className="text-xs font-semibold text-muted-foreground">Year</label>
                  <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    <option value="">Select Year...</option>
                    {years?.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-48">
                  <label className="text-xs font-semibold text-muted-foreground">Class</label>
                  <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} disabled={!selectedYear}>
                    <option value="">Select Class...</option>
                    {classes?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-48">
                  <label className="text-xs font-semibold text-muted-foreground">Section</label>
                  <Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass}>
                    <option value="">Select Section...</option>
                    {sections?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            <div className="w-40">
              <label className="text-xs font-semibold text-muted-foreground">Month</label>
              <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS_LIST.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-32">
              <label className="text-xs font-semibold text-muted-foreground">Year (Calendar)</label>
              <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </Select>
            </div>

            <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download CSV Register
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet Grid */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[260px]">
              <LoadingSpinner />
            </div>
          ) : !registerData || registerData.length === 0 ? (
            <EmptyState
              title="No Records Found"
              description={isStudent ? 'Choose Class/Section filters to load students monthly register.' : 'No active teachers logs.'}
              icon={FileSpreadsheet}
            />
          ) : (
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    {isStudent && <th className="p-3 text-xs font-bold w-16 sticky left-0 bg-muted">Roll No</th>}
                    <th className={`p-3 text-xs font-bold w-52 sticky ${isStudent ? 'left-16' : 'left-0'} bg-muted shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                      {isStudent ? 'Student Name' : 'Faculty Name'}
                    </th>
                    {daysArray.map((day) => (
                      <th key={day} className="p-2 text-center text-xs font-bold w-10">
                        {String(day).padStart(2, '0')}
                      </th>
                    ))}
                    <th className="p-2 text-center text-xs font-bold w-12 bg-emerald-50 dark:bg-emerald-950/20">P</th>
                    <th className="p-2 text-center text-xs font-bold w-12 bg-rose-50 dark:bg-rose-950/20">A</th>
                    <th className="p-2 text-center text-xs font-bold w-12 bg-amber-50 dark:bg-amber-950/20">L</th>
                    <th className="p-2 text-center text-xs font-bold w-12 bg-orange-50 dark:bg-orange-950/20">H</th>
                    {!isStudent && <th className="p-2 text-center text-xs font-bold w-12 bg-blue-50 dark:bg-blue-950/20">OL</th>}
                    <th className="p-3 text-center text-xs font-bold w-16 sticky right-0 bg-muted shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {registerData.map((row: any) => {
                    const st = row.stats;
                    return (
                      <tr key={row.studentId || row.teacherId} className="hover:bg-muted/50">
                        {isStudent && (
                          <td className="p-3 text-xs font-bold sticky left-0 bg-background border-r border-border">
                            {row.rollNumber ?? '-'}
                          </td>
                        )}
                        <td className={`p-3 sticky ${isStudent ? 'left-16' : 'left-0'} bg-background border-r border-border font-semibold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                          {row.fullName}
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {isStudent ? row.admissionNumber : row.employeeId}
                          </p>
                        </td>
                        {daysArray.map((day) => {
                          const status = row.days[day];
                          return (
                            <td key={day} className="p-1 border-r border-border text-center">
                              <span
                                className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold ${
                                  status === 'PRESENT'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : status === 'ABSENT'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                    : status === 'LATE'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                    : status === 'HALF_DAY'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300'
                                    : status === 'ON_LEAVE'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                                    : 'text-muted-foreground/30 font-normal'
                                }`}
                              >
                                {status === 'PRESENT'
                                  ? 'P'
                                  : status === 'ABSENT'
                                  ? 'A'
                                  : status === 'LATE'
                                  ? 'L'
                                  : status === 'HALF_DAY'
                                  ? 'H'
                                  : status === 'ON_LEAVE'
                                  ? 'OL'
                                  : '-'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="p-2 text-center font-bold bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-400">
                          {st.present}
                        </td>
                        <td className="p-2 text-center font-bold bg-rose-50/40 text-rose-800 dark:bg-rose-950/10 dark:text-rose-400">
                          {st.absent}
                        </td>
                        <td className="p-2 text-center font-bold bg-amber-50/40 text-amber-800 dark:bg-amber-950/10 dark:text-amber-400">
                          {st.late}
                        </td>
                        <td className="p-2 text-center font-bold bg-orange-50/40 text-orange-800 dark:bg-orange-950/10 dark:text-orange-400">
                          {st.halfDay}
                        </td>
                        {!isStudent && (
                          <td className="p-2 text-center font-bold bg-blue-50/40 text-blue-800 dark:bg-blue-950/10 dark:text-blue-400">
                            {st.leave}
                          </td>
                        )}
                        <td className="p-3 text-center sticky right-0 bg-background font-bold text-xs border-l border-border shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              st.percentage >= 90
                                ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950 dark:text-emerald-300'
                                : st.percentage >= 75
                                ? 'bg-amber-100 text-amber-850 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-850 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {st.percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
