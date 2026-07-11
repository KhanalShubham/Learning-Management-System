export interface NavItemConfig {
  name: string;
  path?: string; // Optional if it's a dropdown menu with children
  icon: string;
  children?: Omit<NavItemConfig, 'icon'>[];
}

// Version 1 has exactly two login roles (Super Admin, Admin) sharing the same
// operational nav — role-exclusive actions (e.g. role management) are gated by
// permission checks within pages rather than by hiding whole nav sections.
// All paths are absolute under the /dashboard shell (see routes/index.tsx) —
// the site root "/" is the public marketing homepage, not this nav.
const baseNav: NavItemConfig[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  {
    name: 'School Configuration',
    icon: 'Landmark',
    children: [
      { name: 'School Profile', path: '/dashboard/school/profile' },
      { name: 'Academic Years', path: '/dashboard/school/academic-years' },
    ],
  },
  {
    name: 'Students',
    icon: 'GraduationCap',
    children: [
      { name: 'Dashboard', path: '/dashboard/students' },
      { name: 'All Students', path: '/dashboard/students/list' },
      { name: 'Admissions Panel', path: '/dashboard/students/admission' },
    ],
  },
  {
    name: 'Teachers',
    icon: 'Users',
    children: [
      { name: 'Dashboard', path: '/dashboard/teachers' },
      { name: 'All Teachers', path: '/dashboard/teachers/list' },
      { name: 'Register Teacher', path: '/dashboard/teachers/new' },
      { name: 'Departments', path: '/dashboard/teachers/departments' },
      { name: 'Designations', path: '/dashboard/teachers/designations' },
    ],
  },
  {
    name: 'Academic Structure',
    icon: 'BookOpen',
    children: [
      { name: 'Dashboard', path: '/dashboard/academics' },
      { name: 'Classes', path: '/dashboard/academics/classes' },
      { name: 'Sections', path: '/dashboard/academics/sections' },
      { name: 'Subjects', path: '/dashboard/academics/subjects' },
      { name: 'Class Subjects', path: '/dashboard/academics/class-subjects' },
      { name: 'Exam Types', path: '/dashboard/academics/exam-types' },
    ],
  },
  {
    name: 'Examination Engine',
    icon: 'Award',
    children: [
      { name: 'Dashboard', path: '/dashboard/exams' },
      { name: 'Exam Terms', path: '/dashboard/exams/terms' },
      { name: 'Schedules', path: '/dashboard/exams/schedule' },
      { name: 'Marks Ledger', path: '/dashboard/exams/ledger' },
      { name: 'Report Cards', path: '/dashboard/exams/report-cards' },
      { name: 'Analytics', path: '/dashboard/exams/analytics' },
    ],
  },
  { name: 'Attendance Registry', path: '/dashboard/attendance', icon: 'CalendarDays' },
  {
    name: 'Document Engine',
    icon: 'FileSpreadsheet',
    children: [
      { name: 'Dashboard', path: '/dashboard/documents' },
      { name: 'Templates Library', path: '/dashboard/documents/templates' },
      { name: 'Issued History', path: '/dashboard/documents/history' },
    ],
  },
  { name: 'Website CMS', path: '/dashboard/cms', icon: 'Globe' },
  { name: 'User Accounts', path: '/dashboard/users', icon: 'UserCog' },
  { name: 'System Settings', path: '/dashboard/settings', icon: 'Settings' },
];

export const NAVIGATION_CONFIG: Record<'super_admin' | 'admin', NavItemConfig[]> = {
  super_admin: [...baseNav, { name: 'Role Management', path: '/dashboard/roles', icon: 'ShieldCheck' }],
  admin: baseNav,
};
