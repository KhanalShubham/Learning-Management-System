/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PublicRoute } from '@/features/auth/components/PublicRoute';
import { Button } from '@/components/ui/Button';
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
const AttendanceDashboard = lazy(() => import('@/features/attendance/pages/AttendanceDashboard'));
const MarkStudentAttendance = lazy(() => import('@/features/attendance/pages/MarkStudentAttendance'));
const MarkTeacherAttendance = lazy(() => import('@/features/attendance/pages/MarkTeacherAttendance'));
const MonthlyRegister = lazy(() => import('@/features/attendance/pages/MonthlyRegister'));
const StudentDashboard = lazy(() => import('@/features/student/pages/StudentDashboard'));
const Students = lazy(() => import('@/features/student/pages/Students'));
const StudentAdmission = lazy(() => import('@/features/student/pages/StudentAdmission'));
const StudentDetail = lazy(() => import('@/features/student/pages/StudentDetail'));
const FacultyDashboard = lazy(() => import('@/features/faculty/pages/FacultyDashboard'));
const Teachers = lazy(() => import('@/features/faculty/pages/Teachers'));
const TeacherRegistration = lazy(() => import('@/features/faculty/pages/TeacherRegistration'));
const TeacherDetail = lazy(() => import('@/features/faculty/pages/TeacherDetail'));
const Departments = lazy(() => import('@/features/faculty/pages/Departments'));
const Designations = lazy(() => import('@/features/faculty/pages/Designations'));
const CmsAdmin = lazy(() => import('@/features/cms/pages/CmsAdmin'));
const PublicHome = lazy(() => import('@/features/public-site/pages/PublicHome'));
const NoticesList = lazy(() => import('@/features/public-site/pages/NoticesList'));
const NoticeDetail = lazy(() => import('@/features/public-site/pages/NoticeDetail'));
const AcademicsCatalog = lazy(() => import('@/features/public-site/pages/AcademicsCatalog'));
const ProgramDetail = lazy(() => import('@/features/public-site/pages/ProgramDetail'));
const FacultyDirectory = lazy(() => import('@/features/public-site/pages/FacultyDirectory'));
const FacultyProfile = lazy(() => import('@/features/public-site/pages/FacultyProfile'));
const Fees = lazy(() => import('@/features/public-site/pages/Fees'));
const ExamsDashboard = lazy(() => import('@/features/exams/pages/ExamsDashboard'));
const ExamTerms = lazy(() => import('@/features/exams/pages/ExamTerms'));
const ExamSchedules = lazy(() => import('@/features/exams/pages/ExamSchedules'));
const MarksEntryLedger = lazy(() => import('@/features/exams/pages/MarksEntryLedger'));
const ReportCardPreview = lazy(() => import('@/features/exams/pages/ReportCardPreview'));
const ExamsAnalytics = lazy(() => import('@/features/exams/pages/ExamsAnalytics'));

// Document & Certificate Engine Pages
const DocumentDashboard = lazy(() => import('@/features/documents/pages/DocumentDashboard'));
const TemplateLibrary = lazy(() => import('@/features/documents/pages/TemplateLibrary'));
const TemplateEditor = lazy(() => import('@/features/documents/pages/TemplateEditor'));
const DocumentGenerationWizard = lazy(() => import('@/features/documents/pages/DocumentGenerationWizard'));
const DocumentHistory = lazy(() => import('@/features/documents/pages/DocumentHistory'));
const PublicVerifyDocument = lazy(() => import('@/pages/PublicVerifyDocument'));

const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const SessionExpired = lazy(() => import('@/pages/SessionExpired'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-9 w-9 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
  </div>
);

export const router = createBrowserRouter([
  // Public Landing Layout Routes — this is the site root; an unauthenticated
  // (or authenticated) visitor to "/" sees the marketing homepage, not a
  // login redirect. Authenticated users land on /dashboard after sign-in.
  {
    path: '/',
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
    path: '/dashboard',
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
          <ProtectedRoute requiredPermission="teachers.read">
            <Suspense fallback={<PageLoader />}>
              <FacultyDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'teachers/list',
        element: (
          <ProtectedRoute requiredPermission="teachers.read">
            <Suspense fallback={<PageLoader />}>
              <Teachers />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'teachers/new',
        element: (
          <ProtectedRoute requiredPermission="teachers.create">
            <Suspense fallback={<PageLoader />}>
              <TeacherRegistration />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'teachers/departments',
        element: (
          <ProtectedRoute requiredPermission="teachers.read">
            <Suspense fallback={<PageLoader />}>
              <Departments />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'teachers/designations',
        element: (
          <ProtectedRoute requiredPermission="teachers.read">
            <Suspense fallback={<PageLoader />}>
              <Designations />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'teachers/:id',
        element: (
          <ProtectedRoute requiredPermission="teachers.read">
            <Suspense fallback={<PageLoader />}>
              <TeacherDetail />
            </Suspense>
          </ProtectedRoute>
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
          <ProtectedRoute requiredPermission="attendance.view">
            <Suspense fallback={<PageLoader />}>
              <AttendanceDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance/students/mark',
        element: (
          <ProtectedRoute requiredPermission="attendance.mark">
            <Suspense fallback={<PageLoader />}>
              <MarkStudentAttendance />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance/teachers/mark',
        element: (
          <ProtectedRoute requiredPermission="attendance.teacher.mark">
            <Suspense fallback={<PageLoader />}>
              <MarkTeacherAttendance />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance/register',
        element: (
          <ProtectedRoute requiredPermission="attendance.view">
            <Suspense fallback={<PageLoader />}>
              <MonthlyRegister />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams',
        element: (
          <ProtectedRoute requiredPermission="exams.view">
            <Suspense fallback={<PageLoader />}>
              <ExamsDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams/terms',
        element: (
          <ProtectedRoute requiredPermission="exams.manage">
            <Suspense fallback={<PageLoader />}>
              <ExamTerms />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams/schedule',
        element: (
          <ProtectedRoute requiredPermission="exams.view">
            <Suspense fallback={<PageLoader />}>
              <ExamSchedules />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams/ledger',
        element: (
          <ProtectedRoute requiredPermission="exams.enter">
            <Suspense fallback={<PageLoader />}>
              <MarksEntryLedger />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams/report-cards',
        element: (
          <ProtectedRoute requiredPermission="exams.view">
            <Suspense fallback={<PageLoader />}>
              <ReportCardPreview />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams/analytics',
        element: (
          <ProtectedRoute requiredPermission="exams.view">
            <Suspense fallback={<PageLoader />}>
              <ExamsAnalytics />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'cms',
        element: (
          <ProtectedRoute requiredPermission="cms.edit">
            <Suspense fallback={<PageLoader />}>
              <CmsAdmin />
            </Suspense>
          </ProtectedRoute>
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
      // Document Engine routes
      {
        path: 'documents',
        element: (
          <ProtectedRoute requiredPermission="certificates.view">
            <Suspense fallback={<PageLoader />}>
              <DocumentDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents/templates',
        element: (
          <ProtectedRoute requiredPermission="certificates.view">
            <Suspense fallback={<PageLoader />}>
              <TemplateLibrary />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents/templates/:id',
        element: (
          <ProtectedRoute requiredPermission="certificates.generate">
            <Suspense fallback={<PageLoader />}>
              <TemplateEditor />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents/generate',
        element: (
          <ProtectedRoute requiredPermission="certificates.generate">
            <Suspense fallback={<PageLoader />}>
              <DocumentGenerationWizard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents/history',
        element: (
          <ProtectedRoute requiredPermission="certificates.view">
            <Suspense fallback={<PageLoader />}>
              <DocumentHistory />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Standalone Public Document Verification Route
  {
    path: '/verify/:id',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicVerifyDocument />
      </Suspense>
    ),
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
