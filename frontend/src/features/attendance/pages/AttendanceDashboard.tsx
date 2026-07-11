import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, FileSpreadsheet, Plus, Trash2, BadgeCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsCard } from '@/components/common/StatsCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  useStudentDashboardStats,
  useTeacherDashboardStats,
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
} from '../hooks/useAttendance';

export default function AttendanceDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const canMarkStudent = !!user?.permissions.includes('attendance.mark') || !!user?.permissions.includes('*');
  const canViewStudent = !!user?.permissions.includes('attendance.view') || !!user?.permissions.includes('*');
  const canMarkTeacher = !!user?.permissions.includes('attendance.teacher.mark') || !!user?.permissions.includes('*');
  const canViewTeacher = !!user?.permissions.includes('attendance.teacher.view') || !!user?.permissions.includes('*');
  const canWriteSettings = !!user?.permissions.includes('settings.write') || !!user?.permissions.includes('*');

  const { data: studentStats, isLoading: studentLoading } = useStudentDashboardStats();
  const { data: teacherStats, isLoading: teacherLoading } = useTeacherDashboardStats();
  const { data: holidays, isLoading: holidaysLoading } = useHolidays();

  const createHolidayMutation = useCreateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();

  const [holidayName, setHolidayName] = useState('');
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName || !holidayStart || !holidayEnd) {
      toast({ title: 'Please fill out all holiday fields.', variant: 'warning' });
      return;
    }
    try {
      await createHolidayMutation.mutateAsync({
        name: holidayName,
        startDate: holidayStart,
        endDate: holidayEnd,
      });
      toast({ title: 'Holiday closure registered successfully.', variant: 'success' });
      setHolidayName('');
      setHolidayStart('');
      setHolidayEnd('');
    } catch (err: any) {
      toast({
        title: 'Could not create holiday',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await deleteHolidayMutation.mutateAsync(id);
      toast({ title: 'Holiday deleted successfully.', variant: 'success' });
    } catch (err: any) {
      toast({
        title: 'Could not delete holiday',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Attendance Registry</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, log, and view daily records and configurations.
          </p>
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          {canViewStudent && <TabsTrigger value="students">Student Attendance</TabsTrigger>}
          {canViewTeacher && <TabsTrigger value="teachers">Teacher Attendance</TabsTrigger>}
          {canWriteSettings && <TabsTrigger value="settings">Academic Calendar Holidays</TabsTrigger>}
        </TabsList>

        {/* 👤 Student Attendance Tab */}
        {canViewStudent && (
          <TabsContent value="students" className="space-y-6 mt-4">
            {studentLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Student Attendance Rate"
                    value={`${studentStats?.stats?.attendancePercentage ?? 100}%`}
                    change="Today"
                    changeType="neutral"
                    icon="BadgeCheck"
                    description="Present ratio"
                    colorName="emerald"
                  />
                  <StatsCard
                    title="Marked Students"
                    value={studentStats?.stats?.totalMarked ?? 0}
                    change="Today"
                    changeType="neutral"
                    icon="UserCheck"
                    description="Total entries"
                    colorName="blue"
                  />
                  <StatsCard
                    title="Marked Classes"
                    value={studentStats?.markedSections ?? 0}
                    change="Class Sections"
                    changeType="neutral"
                    icon="CalendarDays"
                    description={`Out of ${studentStats?.totalSections ?? 0}`}
                    colorName="violet"
                  />
                  <StatsCard
                    title="Pending Sections"
                    value={studentStats?.pendingSections ?? 0}
                    change="Awaiting mark"
                    changeType="neutral"
                    icon="ShieldAlert"
                    description="Action required"
                    colorName="amber"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Quick Actions & Pending list */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Actions</CardTitle>
                        <CardDescription>Register attendance or inspect monthly registers</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-4">
                        {canMarkStudent && (
                          <Button
                            onClick={() => navigate('/dashboard/attendance/students/mark')}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Mark Student Daily Attendance
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => navigate('/dashboard/attendance/register?type=student')}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          View Student Monthly Register
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Roster Locking Status</CardTitle>
                        <CardDescription>Daily rosters lock automatically after submission to avoid retroactive edits.</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Teachers are permitted to mark and save. Editing a locked date is restricted to Administrators.
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Recent Absentees */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Absentees today</CardTitle>
                        <CardDescription>Track today's absent records</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {studentStats?.recentAbsentees?.length === 0 ? (
                          <EmptyState
                            title="No Absentees Today"
                            description="All marked students are recorded present."
                            icon={BadgeCheck}
                          />
                        ) : (
                          <div className="divide-y divide-border">
                            {studentStats?.recentAbsentees?.map((abs: any) => (
                              <div key={abs.studentId} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold">{abs.fullName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Roll {abs.rollNumber ?? '-'} • {abs.className} - {abs.sectionName}
                                  </p>
                                </div>
                                <Badge variant="destructive">Absent</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        )}

        {/* 🏫 Teacher Attendance Tab */}
        {canViewTeacher && (
          <TabsContent value="teachers" className="space-y-6 mt-4">
            {teacherLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Teacher Attendance Rate"
                    value={`${teacherStats?.stats?.attendancePercentage ?? 100}%`}
                    change="Today"
                    changeType="neutral"
                    icon="BadgeCheck"
                    description="Present / Leave ratio"
                    colorName="emerald"
                  />
                  <StatsCard
                    title="Active Teachers"
                    value={teacherStats?.totalTeachers ?? 0}
                    change="Staff list"
                    changeType="neutral"
                    icon="Users"
                    description="Total active staff"
                    colorName="blue"
                  />
                  <StatsCard
                    title="Marked Today"
                    value={teacherStats?.markedTeachersCount ?? 0}
                    change="Today"
                    changeType="neutral"
                    icon="CalendarDays"
                    description="Completed records"
                    colorName="violet"
                  />
                  <StatsCard
                    title="Absentees / Leave"
                    value={(teacherStats?.stats?.absent ?? 0) + (teacherStats?.stats?.leave ?? 0)}
                    change="Away"
                    changeType="neutral"
                    icon="CalendarX"
                    description={`Absent: ${teacherStats?.stats?.absent ?? 0} | On Leave: ${teacherStats?.stats?.leave ?? 0}`}
                    colorName="amber"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left column: Quick Actions */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Faculty Attendance Actions</CardTitle>
                        <CardDescription>Daily markings and log matrices exports</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-4">
                        {canMarkTeacher && (
                          <Button
                            onClick={() => navigate('/dashboard/attendance/teachers/mark')}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Mark Teacher Daily Attendance
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => navigate('/dashboard/attendance/register?type=teacher')}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          View Teacher Monthly Register
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Absent Faculty */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Absent Faculty Today</CardTitle>
                        <CardDescription>Track absentee teachers</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {teacherStats?.recentAbsentees?.length === 0 ? (
                          <EmptyState
                            title="No Faculty Absent"
                            description="All marked faculty members are present or on leave."
                            icon={BadgeCheck}
                          />
                        ) : (
                          <div className="divide-y divide-border">
                            {teacherStats?.recentAbsentees?.map((abs: any) => (
                              <div key={abs.teacherId} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold">{abs.fullName}</p>
                                  <p className="text-xs text-muted-foreground">{abs.employeeId}</p>
                                </div>
                                <Badge variant="destructive">Absent</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        )}

        {/* 📅 Holidays Tab */}
        {canWriteSettings && (
          <TabsContent value="settings" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Holiday Form */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Register Holiday Closure</CardTitle>
                    <CardDescription>Establish school closure dates. Attendance cannot be logged on holidays.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateHoliday} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Holiday Name</label>
                        <Input
                          placeholder="e.g. Dashain Festival, Strike Day"
                          value={holidayName}
                          onChange={(e) => setHolidayName(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                          <Input
                            type="date"
                            value={holidayStart}
                            onChange={(e) => setHolidayStart(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                          <Input
                            type="date"
                            value={holidayEnd}
                            onChange={(e) => setHolidayEnd(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createHolidayMutation.isPending}
                      >
                        {createHolidayMutation.isPending ? <LoadingSpinner className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add School Closure
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Active Holidays List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Configured Holidays</CardTitle>
                    <CardDescription>Active school closure calendar dates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {holidaysLoading ? (
                      <div className="flex items-center justify-center min-h-[120px]">
                        <LoadingSpinner />
                      </div>
                    ) : holidays?.length === 0 ? (
                      <EmptyState
                        title="No School Closures"
                        description="Holidays list is empty."
                        icon={CalendarDays}
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Closure Name</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>End Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {holidays?.map((hol) => (
                              <TableRow key={hol.id}>
                                <TableCell className="font-semibold text-sm">{hol.name}</TableCell>
                                <TableCell className="text-xs">{new Date(hol.startDate).toISOString().split('T')[0]}</TableCell>
                                <TableCell className="text-xs">{new Date(hol.endDate).toISOString().split('T')[0]}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteHoliday(hol.id)}
                                    disabled={deleteHolidayMutation.isPending}
                                    className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
