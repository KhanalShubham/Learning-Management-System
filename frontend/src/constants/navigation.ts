export interface NavItemConfig {
  name: string;
  path?: string; // Optional if it's a dropdown menu with children
  icon: string;
  children?: Omit<NavItemConfig, 'icon'>[];
}

export const NAVIGATION_CONFIG: Record<'admin' | 'teacher' | 'student', NavItemConfig[]> = {
  admin: [
    { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    {
      name: 'Students',
      icon: 'GraduationCap',
      children: [
        { name: 'All Students', path: '/students' },
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
        { name: 'Classes & Sections', path: '/academics/classes' },
        { name: 'Subjects List', path: '/academics/subjects' },
      ],
    },
    { name: 'Attendance Registry', path: '/attendance', icon: 'CalendarDays' },
    { name: 'Exams & Grading', path: '/exams', icon: 'FileSpreadsheet' },
    { name: 'Fees & Billing', path: '/fees', icon: 'CreditCard' },
    { name: 'Website CMS', path: '/cms', icon: 'Globe' },
    { name: 'System Settings', path: '/settings', icon: 'Settings' },
  ],
  teacher: [
    { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { name: 'My Classes', path: '/teacher/classes', icon: 'BookOpen' },
    { name: 'Mark Attendance', path: '/teacher/attendance', icon: 'CalendarDays' },
    { name: 'Exams & Marks', path: '/teacher/marks', icon: 'FileSpreadsheet' },
    { name: 'Students Registry', path: '/students', icon: 'GraduationCap' },
    { name: 'Leave Application', path: '/teacher/leave', icon: 'ClipboardList' },
  ],
  student: [
    { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { name: 'My Classes', path: '/student/classes', icon: 'BookOpen' },
    { name: 'My Attendance', path: '/student/attendance', icon: 'CalendarDays' },
    { name: 'Exams & Results', path: '/student/exams', icon: 'FileSpreadsheet' },
    { name: 'Fees & Invoices', path: '/student/fees', icon: 'CreditCard' },
    { name: 'Leave Application', path: '/student/leave', icon: 'ClipboardList' },
  ],
};
