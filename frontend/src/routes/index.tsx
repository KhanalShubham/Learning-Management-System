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
import { Alert } from '@/components/ui/Alert';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ChangePassword = lazy(() => import('@/pages/ChangePassword'));
const SchoolProfile = lazy(() => import('@/pages/SchoolProfile'));
const AcademicYears = lazy(() => import('@/pages/AcademicYears'));
const ClassesAndSections = lazy(() => import('@/pages/ClassesAndSections'));
const Subjects = lazy(() => import('@/pages/Subjects'));
const ClassSubjects = lazy(() => import('@/pages/ClassSubjects'));
const Users = lazy(() => import('@/pages/Users'));
const Roles = lazy(() => import('@/pages/Roles'));
const StudentDashboard = lazy(() => import('@/features/student/pages/StudentDashboard'));
const Students = lazy(() => import('@/features/student/pages/Students'));
const StudentAdmission = lazy(() => import('@/features/student/pages/StudentAdmission'));
const StudentDetail = lazy(() => import('@/features/student/pages/StudentDetail'));
const PublicHome = lazy(() => import('@/features/public-site/pages/PublicHome'));
const NoticesList = lazy(() => import('@/features/public-site/pages/NoticesList'));
const NoticeDetail = lazy(() => import('@/features/public-site/pages/NoticeDetail'));
const AcademicsCatalog = lazy(() => import('@/features/public-site/pages/AcademicsCatalog'));
const ProgramDetail = lazy(() => import('@/features/public-site/pages/ProgramDetail'));
const FacultyDirectory = lazy(() => import('@/features/public-site/pages/FacultyDirectory'));
const FacultyProfile = lazy(() => import('@/features/public-site/pages/FacultyProfile'));
const Fees = lazy(() => import('@/features/public-site/pages/Fees'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const SessionExpired = lazy(() => import('@/pages/SessionExpired'));
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
      {
        path: 'notices',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NoticesList />
          </Suspense>
        ),
      },
      {
        path: 'notices/:slug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NoticeDetail />
          </Suspense>
        ),
      },
      {
        path: 'academics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AcademicsCatalog />
          </Suspense>
        ),
      },
      {
        path: 'academics/:slug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramDetail />
          </Suspense>
        ),
      },
      {
        path: 'faculty',
        element: (
          <Suspense fallback={<PageLoader />}>
            <FacultyDirectory />
          </Suspense>
        ),
      },
      {
        path: 'faculty/:slug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <FacultyProfile />
          </Suspense>
        ),
      },
      {
        path: 'fees',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Fees />
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
  {
    path: '/forgot-password',
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
            <ForgotPassword />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/reset-password',
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
            <ResetPassword />
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
        path: 'school/profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SchoolProfile />
          </Suspense>
        ),
      },
      {
        path: 'school/academic-years',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AcademicYears />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredPermission="users.read">
            <Suspense fallback={<PageLoader />}>
              <Users />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute requiredPermission="roles.write">
            <Suspense fallback={<PageLoader />}>
              <Roles />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'students',
        element: (
          <ProtectedRoute requiredPermission="students.read">
            <Suspense fallback={<PageLoader />}>
              <StudentDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/list',
        element: (
          <ProtectedRoute requiredPermission="students.read">
            <Suspense fallback={<PageLoader />}>
              <Students />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/admission',
        element: (
          <ProtectedRoute requiredPermission="students.admit">
            <Suspense fallback={<PageLoader />}>
              <StudentAdmission />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/:id',
        element: (
          <ProtectedRoute requiredPermission="students.read">
            <Suspense fallback={<PageLoader />}>
              <StudentDetail />
            </Suspense>
          </ProtectedRoute>
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
            <ClassesAndSections />
          </Suspense>
        ),
      },
      {
        path: 'academics/subjects',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Subjects />
          </Suspense>
        ),
      },
      {
        path: 'academics/subject-allocation',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ClassSubjects />
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
        path: 'change-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChangePassword />
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

  // Session expired view
  {
    path: '/session-expired',
    element: (
      <Suspense fallback={<PageLoader />}>
        <SessionExpired />
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
