/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Save, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/use-toast';
import { useTeachers } from '@/features/faculty/hooks/useTeachers';
import {
  useTeacherDaily,
  useMarkTeacherAttendance,
  useHolidays,
} from '../hooks/useAttendance';
import type { TeacherAttendanceStatus } from '../types';

export default function MarkTeacherAttendance() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<
    Array<{ teacherId: string; employeeId: string; fullName: string; status: TeacherAttendanceStatus; remarks: string }>
  >([]);

  // 1. Fetch Active Teachers List
  const { data: teachersData, isLoading: teachersLoading } = useTeachers({
    status: 'ACTIVE',
    take: 100,
  });

  // 2. Fetch Holidays closures list
  const { data: holidays } = useHolidays();
  const [holidayReason, setHolidayReason] = useState<string | null>(null);

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

  // 3. Query Daily Teacher Attendance Logs
  const { data: dailyRecords, isLoading: dailyLoading } = useTeacherDaily(selectedDate);

  // Map database logs or default list
  useEffect(() => {
    if (dailyRecords && dailyRecords.length > 0) {
      const mapped = dailyRecords.map((r) => ({
        teacherId: r.teacherId,
        employeeId: r.teacher?.employeeId ?? 'EMP',
        fullName: r.teacher ? `${r.teacher.firstName}${r.teacher.middleName ? ' ' + r.teacher.middleName : ''} ${r.teacher.lastName}` : 'Teacher',
        status: r.status,
        remarks: r.remarks ?? '',
      }));
      setAttendanceData(mapped);
    } else if (teachersData?.data) {
      const mapped = teachersData.data.map((t: any) => ({
        teacherId: t.id,
        employeeId: t.employeeId,
        fullName: `${t.firstName}${t.middleName ? ' ' + t.middleName : ''} ${t.lastName}`,
        status: 'PRESENT' as TeacherAttendanceStatus,
        remarks: '',
      }));
      setAttendanceData(mapped);
    } else {
      setAttendanceData([]);
    }
  }, [dailyRecords, teachersData]);

  // Mutations
  const markAttendanceMutation = useMarkTeacherAttendance();

  const handleStatusChange = (teacherId: string, status: TeacherAttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((row) => (row.teacherId === teacherId ? { ...row, status } : row))
    );
  };

  const handleRemarksChange = (teacherId: string, remarks: string) => {
    setAttendanceData((prev) =>
      prev.map((row) => (row.teacherId === teacherId ? { ...row, remarks } : row))
    );
  };

  const handleMarkAll = (status: TeacherAttendanceStatus) => {
    setAttendanceData((prev) => prev.map((row) => ({ ...row, status })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceData.length === 0) {
      toast({ title: 'No faculty to mark attendance for.', variant: 'warning' });
      return;
    }

    try {
      await markAttendanceMutation.mutateAsync({
        date: selectedDate,
        records: attendanceData.map((r) => ({
          teacherId: r.teacherId,
          status: r.status,
          remarks: r.remarks || null,
        })),
      });

      toast({ title: 'Teacher attendance saved successfully.', variant: 'success' });
      navigate('/dashboard/attendance');
    } catch (err: any) {
      toast({
        title: 'Failed to save teacher attendance',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    }
  };

  const isFormDisabled = !selectedDate || !!holidayReason || markAttendanceMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/attendance')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Mark Teacher Attendance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Record daily faculty attendance logs.</p>
        </div>
      </div>

      {/* Date Filter Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-xs">
            <label className="text-xs font-semibold text-muted-foreground">Attendance Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Holiday closure check banner */}
      {holidayReason && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {holidayReason} Attendance cannot be recorded on weekends or custom holidays.
        </Alert>
      )}

      {/* Daily marks list */}
      {selectedDate && !holidayReason && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
              <div>
                <CardTitle>Faculty Attendance Roster</CardTitle>
                <CardDescription>
                  Date: {selectedDate} • Total Active Staff: {attendanceData.length}
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
              {dailyLoading || teachersLoading ? (
                <div className="flex items-center justify-center min-h-[160px]">
                  <LoadingSpinner />
                </div>
              ) : attendanceData.length === 0 ? (
                <EmptyState
                  title="No Active Faculty"
                  description="No teachers are registered active in the system."
                  icon={Users}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Employee ID</TableHead>
                        <TableHead>Teacher Name</TableHead>
                        <TableHead className="w-[450px] text-center">Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceData.map((row) => (
                        <TableRow key={row.teacherId}>
                          <TableCell className="font-semibold text-xs">{row.employeeId}</TableCell>
                          <TableCell className="font-semibold text-sm">{row.fullName}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-3">
                              {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'] as TeacherAttendanceStatus[]).map((status) => (
                                <label key={status} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                  <input
                                    type="radio"
                                    name={`status-${row.teacherId}`}
                                    checked={row.status === status}
                                    onChange={() => handleStatusChange(row.teacherId, status)}
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
                                        : status === 'HALF_DAY'
                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
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
                                      : 'OL'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Add remarks..."
                              value={row.remarks}
                              onChange={(e) => handleRemarksChange(row.teacherId, e.target.value)}
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
            <CardContent className="flex justify-end border-t border-border pt-4">
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="bg-primary hover:bg-primary/90 text-white font-bold"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Teacher Roster
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
