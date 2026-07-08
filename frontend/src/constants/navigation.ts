export interface NavItemConfig {
  name: string;
  path?: string; // Optional if it's a dropdown menu with children
  icon: string;
  children?: Omit<NavItemConfig, 'icon'>[];
}

// Version 1 has exactly two login roles (Super Admin, Admin) sharing the same
// operational nav — role-exclusive actions (e.g. role management) are gated by
// permission checks within pages rather than by hiding whole nav sections.
const baseNav: NavItemConfig[] = [
  { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  {
    name: 'School Configuration',
    icon: 'Landmark',
    children: [
      { name: 'School Profile', path: '/school/profile' },
      { name: 'Academic Years', path: '/school/academic-years' },
    ],
  },
  {
    name: 'Students',
    icon: 'GraduationCap',
    children: [
      { name: 'Dashboard', path: '/students' },
      { name: 'All Students', path: '/students/list' },
      { name: 'Admissions Panel', path: '/students/admission' },
    ],
  },
  {
    name: 'Teachers',
    icon: 'Users',
    children: [
      { name: 'All Teachers', path: '/teachers' },
      { name: 'Designations', path: '/teachers/designations' },
    ],
  },
  {
    name: 'Academic Structure',
    icon: 'BookOpen',
    children: [
      { name: 'Dashboard', path: '/academics' },
      { name: 'Classes', path: '/academics/classes' },
      { name: 'Sections', path: '/academics/sections' },
      { name: 'Subjects', path: '/academics/subjects' },
      { name: 'Class Subjects', path: '/academics/class-subjects' },
      { name: 'Exam Types', path: '/academics/exam-types' },
    ],
  },
  { name: 'Attendance Registry', path: '/attendance', icon: 'CalendarDays' },
  { name: 'Exams & Grading', path: '/exams', icon: 'FileSpreadsheet' },
  { name: 'Fees & Billing', path: '/fees', icon: 'CreditCard' },
  { name: 'Website CMS', path: '/cms', icon: 'Globe' },
  { name: 'User Accounts', path: '/users', icon: 'UserCog' },
  { name: 'System Settings', path: '/settings', icon: 'Settings' },
];

export const NAVIGATION_CONFIG: Record<'super_admin' | 'admin', NavItemConfig[]> = {
  super_admin: [...baseNav, { name: 'Role Management', path: '/roles', icon: 'ShieldCheck' }],
  admin: baseNav,
};
