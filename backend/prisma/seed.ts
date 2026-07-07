import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Configuration definitions for default system permissions
const permissionsList = [
  // Full System Access (Super Admin only — bypasses all permission checks)
  { code: '*', description: 'Full, unrestricted system access' },

  // User Management
  { code: 'users.read', description: 'View user profiles and settings' },
  { code: 'users.write', description: 'Create, update, and manage user accounts' },

  // Role Management
  { code: 'roles.read', description: 'View roles and their permission sets' },
  { code: 'roles.write', description: 'Create, update, and manage roles and permissions' },

  // Student Admission Engine
  { code: 'students.read', description: 'View student registries and profiles' },
  { code: 'students.admit', description: 'Run the admission workflow to enroll new students' },
  { code: 'students.update', description: 'Modify active student details, guardians, and documents' },
  {
    code: 'students.archive',
    description: 'Change student lifecycle status (transferred/graduated/withdrawn) or remove a record',
  },

  // Teacher Management
  { code: 'teachers.read', description: 'View faculty details' },
  { code: 'teachers.create', description: 'Register new faculty instructors' },
  { code: 'teachers.update', description: 'Modify faculty records' },
  { code: 'teachers.delete', description: 'Remove faculty accounts' },

  // Attendance Module
  { code: 'attendance.mark', description: 'Mark student class attendance records' },
  { code: 'attendance.view', description: 'View attendance logs and graphs' },

  // Exam Grading Module
  { code: 'exams.publish', description: 'Publish exam schedules and bounds' },
  { code: 'exams.enter', description: 'Input grading ledger marks' },
  { code: 'exams.view', description: 'View grade transcripts and cards' },

  // Certificates Module
  { code: 'certificates.generate', description: 'Generate course accomplishment cards' },
  { code: 'certificates.download', description: 'Download generated certificates' },
  { code: 'certificates.view', description: 'Inspect student certificates status' },

  // Content Management System
  { code: 'cms.publish', description: 'Publish announcements and event sliders' },
  { code: 'cms.edit', description: 'Create and update CMS content' },

  // Finance Module
  { code: 'finance.read', description: 'View fee records, salary, and payment history' },
  { code: 'finance.write', description: 'Record fee payments and manage salary entries' },

  // System Config
  { code: 'settings.read', description: 'Inspect general campus parameters' },
  { code: 'settings.write', description: 'Modify enterprise ERP configuration settings' },

  // System Configuration Engine (school profile, branding, academic years)
  {
    code: 'system.read',
    description: 'View school profile, branding, leadership, settings, academic years, terms, and grading',
  },
  {
    code: 'system.write',
    description: 'Modify school profile, branding, leadership, settings, academic years, terms, and grading',
  },

  // Academic Engine (classes, sections, subjects, class subjects, exam types)
  { code: 'academic.read', description: 'View classes, sections, subjects, class subjects, and exam types' },
  { code: 'academic.create', description: 'Create classes, sections, subjects, class subjects, and exam types' },
  { code: 'academic.update', description: 'Modify classes, sections, subjects, class subjects, and exam types' },
  {
    code: 'academic.archive',
    description: 'Archive or delete classes, sections, subjects, class subjects, and exam types',
  },
];

// Permissions granted to the day-to-day School Admin role.
// Excludes role management, and full settings.write — these remain Super Admin exclusives.
const adminPermissions = [
  'users.read',
  'users.write',
  // Admin can view roles (needed to assign a role when creating/editing a
  // user) but lacks roles.write, so creating/renaming/deleting roles stays
  // a Super Admin exclusive.
  'roles.read',
  'students.read',
  'students.admit',
  'students.update',
  'students.archive',
  'teachers.read',
  'teachers.create',
  'teachers.update',
  'teachers.delete',
  'attendance.mark',
  'attendance.view',
  'exams.publish',
  'exams.enter',
  'exams.view',
  'certificates.generate',
  'certificates.download',
  'certificates.view',
  'cms.publish',
  'cms.edit',
  'finance.read',
  'finance.write',
  'settings.read',
  'system.read',
  'system.write',
  'academic.read',
  'academic.create',
  'academic.update',
  'academic.archive',
];

async function main() {
  console.log('🌱 Starting database seeding configuration...');

  // 1. Flush existing database tables safely in dependency order
  await prisma.rolePermission.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  console.log('🧹 Existing database records cleared.');

  // 2. Insert all standard system permissions
  const createdPermissions = [];
  for (const perm of permissionsList) {
    const created = await prisma.permission.create({
      data: perm,
    });
    createdPermissions.push(created);
  }
  console.log(`✅ ${createdPermissions.length} permissions created.`);

  // 3. Create default system roles (Version 1: Super Admin + Admin only)
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Software owner with full, unrestricted system access.',
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'School staff account responsible for day-to-day operations.',
    },
  });

  console.log('✅ Default system roles created (SUPER_ADMIN, ADMIN).');

  // 4. Map permissions to Roles via Junction Table
  // Super Admin gets the wildcard permission only — requirePermission() treats '*' as all-access.
  const wildcardPermission = createdPermissions.find((perm) => perm.code === '*')!;
  await prisma.rolePermission.create({
    data: { roleId: superAdminRole.id, permissionId: wildcardPermission.id },
  });

  // Admin gets the explicit day-to-day operations permission set.
  const adminJunctionData = createdPermissions
    .filter((perm) => adminPermissions.includes(perm.code))
    .map((perm) => ({
      roleId: adminRole.id,
      permissionId: perm.id,
    }));
  await prisma.rolePermission.createMany({ data: adminJunctionData });

  console.log('✅ Role-Permission mappings seeded.');

  // 5. Create default Super Admin and Admin user accounts
  const superAdminEmail = 'superadmin@deukhuri.edu.np';
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 12);

  await prisma.user.create({
    data: {
      email: superAdminEmail,
      password: superAdminPassword,
      fullName: 'Super Administrator',
      roleId: superAdminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  const adminEmail = 'admin@deukhuri.edu';
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: adminPassword,
      fullName: 'School Administrator',
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`👤 Super admin account created: ${superAdminEmail} / SuperAdmin@123`);
  console.log(`👤 School admin account created: ${adminEmail} / Admin@123`);

  // 6. Seed reference data for the Academic Structure Engine (idempotent upserts —
  // safe to rerun without wiping school-configured classes/subjects).
  let currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!currentYear) {
    currentYear = await prisma.academicYear.upsert({
      where: { label: '2082/83' },
      update: { isCurrent: true },
      create: {
        label: '2082/83',
        startDate: new Date('2025-04-14'),
        endDate: new Date('2026-04-13'),
        isCurrent: true,
      },
    });
    console.log(`✅ Default current academic year ready: ${currentYear.label}`);
  }

  const classLadder = [
    'Nursery',
    'LKG',
    'UKG',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
  ];
  for (const [index, name] of classLadder.entries()) {
    await prisma.class.upsert({
      where: { academicYearId_name: { academicYearId: currentYear.id, name } },
      update: {},
      create: { academicYearId: currentYear.id, name, displayOrder: index + 1 },
    });
  }
  console.log(`✅ ${classLadder.length} default classes seeded for ${currentYear.label}.`);

  const subjectCatalog = [
    { name: 'English', code: 'ENG' },
    { name: 'Nepali', code: 'NEP' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'Social Studies', code: 'SOC' },
    { name: 'Computer Science', code: 'CS' },
  ];
  for (const subject of subjectCatalog) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: subject,
    });
  }
  console.log(`✅ ${subjectCatalog.length} default subjects seeded.`);

  console.log('🌱 Seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding process encountered a fatal error:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
