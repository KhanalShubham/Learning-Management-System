/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PublicRoute } from '@/features/auth/components/PublicRoute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const PublicHome = lazy(() => import('@/pages/PublicHome'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-9 w-9 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
  </div>
);

export const router = createBrowserRouter([
  // Public Landing Layout Routes
  {
    path: '/public',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PublicHome />
          </Suspense>
        ),
      },
    ],
  },

  // Auth Layout Routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        ),
      },
    ],
  },

  // Dashboard Framework Layout Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'students',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Students Registry</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage and view all students currently enrolled in Deukhuri Digital Campus.</p>
                </div>
                <Button size="sm">Admit Student</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll #</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Grade Section</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Fees Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { roll: '101', name: 'Sita Kumari', grade: 'Grade 10 - Sec A', date: '2024-03-12', status: 'Paid' },
                    { roll: '102', name: 'Ram Bahadur', grade: 'Grade 10 - Sec A', date: '2024-03-14', status: 'Overdue' },
                    { roll: '103', name: 'Chandra Prasad', grade: 'Grade 11 - Sec B', date: '2024-03-15', status: 'Paid' },
                    { roll: '104', name: 'Gita Devkota', grade: 'Grade 9 - Sec A', date: '2024-03-18', status: 'Pending' },
                  ].map((s) => (
                    <TableRow key={s.roll}>
                      <TableCell>{s.roll}</TableCell>
                      <TableCell className="font-semibold text-foreground">{s.name}</TableCell>
                      <TableCell>{s.grade}</TableCell>
                      <TableCell>{s.date}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'Paid' ? 'success' : s.status === 'Overdue' ? 'destructive' : 'warning'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'students/admission',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Admissions Panel</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Admit new applicants and allocate academic roll sections.</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-xl space-y-4 max-w-xl">
                <Input label="Student Full Name" placeholder="e.g. Sita Devi" />
                <Select
                  label="Select Class Grade"
                  options={[
                    { value: '9', label: 'Grade 9' },
                    { value: '10', label: 'Grade 10' },
                    { value: '11', label: 'Grade 11' },
                    { value: '12', label: 'Grade 12' },
                  ]}
                />
                <Button className="w-full">Submit Admission Request</Button>
              </div>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'teachers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Teachers Directory</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Academic instructors, coordinators, and designation mappings.</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Lectures / Week</TableHead>
                    <TableHead>Designation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'Hari Prasad', dept: 'English & Arts', lectures: '18 hrs', title: 'Senior Lecturer' },
                    { name: 'Laxmi Kumari', dept: 'Mathematics', lectures: '22 hrs', title: 'Department Head' },
                    { name: 'Gopal Dev', dept: 'Natural Sciences', lectures: '14 hrs', title: 'Assistant Professor' },
                  ].map((t) => (
                    <TableRow key={t.name}>
                      <TableCell className="font-semibold text-foreground">{t.name}</TableCell>
                      <TableCell>{t.dept}</TableCell>
                      <TableCell>{t.lectures}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t.title}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'teachers/designations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Faculty Designations</h2>
              <p className="text-muted-foreground mt-1 text-xs">Configure job titles, departments, and payroll profiles.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'academics/classes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Classes & Sections</h2>
              <p className="text-muted-foreground mt-1 text-xs">Establish school grades, semesters, and sections layout config.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'academics/subjects',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Subjects Registry</h2>
              <p className="text-muted-foreground mt-1 text-xs">Manage curricula, syllabus chapters, and assign course code mappings.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'attendance',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Daily Attendance Registry</h2>
              <p className="text-muted-foreground mt-1 text-xs">File records, track absence excuses, and review statistics dashboards.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'exams',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Exams & Term Grading</h2>
              <p className="text-muted-foreground mt-1 text-xs">Configure test structures, grading boundaries, and download transcript cards.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'fees',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Fees Invoicing & Finances</h2>
              <p className="text-muted-foreground mt-1 text-xs">Dispatch receipts, log offline collections, and check outstanding balances.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'cms',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Website Content CMS</h2>
              <p className="text-muted-foreground mt-1 text-xs">Author blog entries, campus notices, announcements, and events sliders.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">System Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure general ERP parameters, theme choices, and profile logs.</p>
              </div>

              <Tabs defaultValue="general" className="w-full">
                <TabsList>
                  <TabsTrigger value="general">General Config</TabsTrigger>
                  <TabsTrigger value="academic">Academic Settings</TabsTrigger>
                  <TabsTrigger value="notifications">Alert Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4">
                  <div className="bg-card border border-border p-6 rounded-xl max-w-xl space-y-4">
                    <Input label="Campus Enterprise Name" defaultValue="Deukhuri Digital Campus" />
                    <Input label="Admin Email Contact" defaultValue="office@deukhuri.edu" />
                    <Button>Save Settings</Button>
                  </div>
                </TabsContent>
                <TabsContent value="academic" className="space-y-4">
                  <Alert variant="info" title="Configuration Mode">
                    All academic settings variables are read-only until the role-based database sprint.
                  </Alert>
                </TabsContent>
                <TabsContent value="notifications" className="space-y-4">
                  <div className="bg-card border border-border p-6 rounded-xl max-w-xl">
                    <p className="text-xs text-muted-foreground">Notifications push notifications set to active.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Suspense>
        ),
      },
      // Teacher Specific Workflows Redirect Mock
      {
        path: 'teacher/*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Teacher Dashboard Panel</h2>
              <p className="text-muted-foreground mt-1 text-xs">Accessing grading ledgers, lectures schedule, or classroom checklists.</p>
            </div>
          </Suspense>
        ),
      },
      // Student Specific Workflows Redirect Mock
      {
        path: 'student/*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Student Dashboard Panel</h2>
              <p className="text-muted-foreground mt-1 text-xs">Accessing attendance graphs, term exam reports, or invoice records.</p>
            </div>
          </Suspense>
        ),
      },
    ],
  },

  // Unauthorized view
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Unauthorized />
      </Suspense>
    ),
  },

  // Fallbacks
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
