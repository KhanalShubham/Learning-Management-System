/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Save, GraduationCap } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAcademicYears } from '@/features/school/hooks/useAcademicYears';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useSections } from '@/features/academic-structure/hooks/useSections';
import { useStudents } from '@/features/student/hooks/useStudents';
import {
  useStudentDaily,
  useMarkStudentAttendance,
  useHolidays,
  useToggleLock,
} from '../hooks/useAttendance';
import type { AttendanceStatus } from '../types';

export default function MarkStudentAttendance() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const isConfigurator = !!user?.permissions.includes('attendance.teacher.mark') || !!user?.permissions.includes('*');

  // Filters State
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Roster Local Data
  const [attendanceData, setAttendanceData] = useState<
    Array<{ studentId: string; rollNumber: number | null; fullName: string; status: AttendanceStatus; remarks: string }>
  >([]);

  // 1. Fetch Filters Data
  const { data: years } = useAcademicYears();
  const { data: classes } = useClasses(selectedYear);
  const { data: sections } = useSections(selectedClass);

  // Set default current year
  useEffect(() => {
    if (years && years.length > 0 && !selectedYear) {
      const current = years.find((y) => y.isCurrent);
      if (current) setSelectedYear(current.id);
      else setSelectedYear(years[0].id);
    }
  }, [years, selectedYear]);

  // 2. Fetch Holiday list to check calendar closures
  const { data: holidays } = useHolidays();
  const [holidayReason, setHolidayReason] = useState<string | null>(null);

  // Check if target date is Saturday or registered holiday
  useEffect(() => {
    if (!selectedDate) {
      setHolidayReason(null);
      return;
    }
    const dateObj = new Date(`${selectedDate}T00:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay();
    if (dayOfWeek === 6) {
      setHolidayReason('Saturday is a standard weekend.');
      return;
    }

    if (holidays) {
      const match = holidays.find((h) => {
        const start = new Date(h.startDate);
        const end = new Date(h.endDate);
        return dateObj >= start && dateObj <= end;
      });
      if (match) {
        setHolidayReason(`Registered School Holiday: ${match.name}`);
        return;
      }
    }
    setHolidayReason(null);
  }, [selectedDate, holidays]);

  // 3. Query Daily Attendance Logs and Enrolled Students
  const { data: dailyRecords, isLoading: dailyLoading } = useStudentDaily(
    selectedDate,
    selectedClass,
    selectedSection,
    selectedYear
  );

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    academicYearId: selectedYear || undefined,
    classId: selectedClass || undefined,
    sectionId: selectedSection || undefined,
    take: 100,
  });

  // To make it simple and reactive: we can let Admin toggle isLocked directly on this page!
  const [lockedFlag, setLockedFlag] = useState(false);

  // Map database records or fallback to default roster
  useEffect(() => {
    if (dailyRecords && dailyRecords.length > 0) {
      const mapped = dailyRecords.map((r) => ({
        studentId: r.studentId,
        rollNumber: r.student?.admissionNumber ? 1 : null, // Fallback
        fullName: r.student ? `${r.student.firstName}${r.student.middleName ? ' ' + r.student.middleName : ''} ${r.student.lastName}` : 'Student',
        status: r.status,
        remarks: r.remarks ?? '',
      }));
      // Find roll numbers from studentsData to enrich
      if (studentsData?.data) {
        mapped.forEach((m) => {
          const matched = studentsData.data.find((s: any) => s.id === m.studentId);
          if (matched) {
            const activeEnroll = matched.enrollments?.find((e: any) => e.academicYearId === selectedYear);
            m.rollNumber = activeEnroll?.rollNumber ?? null;
          }
        });
      }
      setAttendanceData(mapped);
    } else if (studentsData?.data) {
      const activeStudents = studentsData.data.filter((s: any) => s.status === 'ACTIVE');
      const mapped = activeStudents.map((s: any) => {
        const activeEnroll = s.enrollments?.find((e: any) => e.academicYearId === selectedYear);
        return {
          studentId: s.id,
          rollNumber: activeEnroll?.rollNumber ?? null,
          fullName: `${s.firstName}${s.middleName ? ' ' + s.middleName : ''} ${s.lastName}`,
          status: 'PRESENT' as AttendanceStatus,
          remarks: '',
        };
      });
      // Sort by roll number
      mapped.sort((a: any, b: any) => (a.rollNumber ?? 999) - (b.rollNumber ?? 999));
      setAttendanceData(mapped);
    } else {
      setAttendanceData([]);
    }
  }, [dailyRecords, studentsData, selectedYear]);

  // Mutations
  const markAttendanceMutation = useMarkStudentAttendance();
  const toggleLockMutation = useToggleLock();

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, status } : row))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, remarks } : row))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendanceData((prev) => prev.map((row) => ({ ...row, status })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceData.length === 0) {
      toast({ title: 'No students to mark attendance for.', variant: 'warning' });
      return;
    }

    try {
      await markAttendanceMutation.mutateAsync({
        academicYearId: selectedYear,
        classId: selectedClass,
        sectionId: selectedSection,
        date: selectedDate,
        records: attendanceData.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks || null,
        })),
      });

      // If lock flag checkbox is selected (Admin only)
      if (isConfigurator && lockedFlag) {
        await toggleLockMutation.mutateAsync({
          date: selectedDate,
          sectionId: selectedSection,
          isLocked: true,
        });
      }

      toast({ title: 'Roster attendance saved successfully.', variant: 'success' });
      navigate('/dashboard/attendance');
    } catch (err: any) {
      toast({
        title: 'Failed to save attendance',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    }
  };

  const isFormDisabled =
    !selectedYear ||
    !selectedClass ||
    !selectedSection ||
    !selectedDate ||
    !!holidayReason ||
    markAttendanceMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/attendance')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Mark Student Attendance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Record daily student attendance sheets.</p>
        </div>
      </div>

      {/* Roster Filters */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm">Roster Filters Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Academic Year</label>
              <Select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedClass('');
                  setSelectedSection('');
                }}
              >
                <option value="">Select Year...</option>
                {years?.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.label} {y.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Class Tier</label>
              <Select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                }}
                disabled={!selectedYear}
              >
                <option value="">Select Class...</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Course Section</label>
              <Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
              >
                <option value="">Select Section...</option>
                {sections?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Attendance Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holiday / Weekend Warning Banner */}
      {holidayReason && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {holidayReason} Attendance cannot be recorded on weekends or custom holidays.
        </Alert>
      )}

      {/* Roster Sheet */}
      {selectedYear && selectedClass && selectedSection && !holidayReason && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
              <div>
                <CardTitle>Attendance Sheet Roster</CardTitle>
                <CardDescription>
                  Date: {selectedDate} • Total Enrolled: {attendanceData.length}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('PRESENT')}>
                  Mark All Present
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('ABSENT')}>
                  Mark All Absent
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {dailyLoading || studentsLoading ? (
                <div className="flex items-center justify-center min-h-[160px]">
                  <LoadingSpinner />
                </div>
              ) : attendanceData.length === 0 ? (
                <EmptyState
                  title="No Active Students"
                  description="No students are enrolled in this class and section."
                  icon={GraduationCap}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="w-96 text-center">Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceData.map((row) => (
                        <TableRow key={row.studentId}>
                          <TableCell className="font-semibold text-sm">{row.rollNumber ?? '-'}</TableCell>
                          <TableCell className="font-semibold text-sm">{row.fullName}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-4">
                              {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] as AttendanceStatus[]).map((status) => (
                                <label key={status} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                  <input
                                    type="radio"
                                    name={`status-${row.studentId}`}
                                    checked={row.status === status}
                                    onChange={() => handleStatusChange(row.studentId, status)}
                                    className="cursor-pointer"
                                  />
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-bold ${
                                      status === 'PRESENT'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : status === 'ABSENT'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        : status === 'LATE'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                    }`}
                                  >
                                    {status === 'PRESENT' ? 'P' : status === 'ABSENT' ? 'A' : status === 'LATE' ? 'L' : 'H'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Add remarks..."
                              value={row.remarks}
                              onChange={(e) => handleRemarksChange(row.studentId, e.target.value)}
                              className="h-8 py-0"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                {isConfigurator && (
                  <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockedFlag}
                      onChange={(e) => setLockedFlag(e.target.checked)}
                      className="cursor-pointer"
                    />
                    Lock attendance session after save
                  </label>
                )}
              </div>
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="bg-primary hover:bg-primary/90 text-white font-bold"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Student Roster
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
