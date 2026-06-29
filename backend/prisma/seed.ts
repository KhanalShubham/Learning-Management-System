import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Configuration definitions for default system permissions
const permissionsList = [
  // User Management
  { code: 'users.read', description: 'View user profiles and settings' },
  { code: 'users.write', description: 'Create, update, and manage user accounts' },

  // Student Management
  { code: 'students.read', description: 'View student registries and profiles' },
  { code: 'students.create', description: 'Admit new students into the ERP' },
  { code: 'students.update', description: 'Modify active student details' },
  { code: 'students.delete', description: 'Remove student records from the register' },

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

  // System Config
  { code: 'settings.read', description: 'Inspect general campus parameters' },
  { code: 'settings.write', description: 'Modify enterprise ERP configuration settings' },
];

// Helper maps to assign permission code patterns to default roles
const teacherPermissions = [
  'students.read',
  'attendance.mark',
  'attendance.view',
  'exams.enter',
  'exams.view',
  'certificates.view',
];

const studentPermissions = [
  'attendance.view',
  'exams.view',
  'certificates.download',
  'certificates.view',
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

  // 3. Create default system roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'System Administrator with full access credentials.',
    },
  });

  const teacherRole = await prisma.role.create({
    data: {
      name: 'TEACHER',
      description: 'Campus Academic Instructor and lecturer.',
    },
  });

  const studentRole = await prisma.role.create({
    data: {
      name: 'STUDENT',
      description: 'Campus enrolled student.',
    },
  });

  console.log('✅ Default system roles created (ADMIN, TEACHER, STUDENT).');

  // 4. Map permissions to Roles via Junction Table
  // Admin role maps to all permissions
  const adminJunctionData = createdPermissions.map((perm) => ({
    roleId: adminRole.id,
    permissionId: perm.id,
  }));
  await prisma.rolePermission.createMany({ data: adminJunctionData });

  // Teacher role maps to teacher permissions
  const teacherJunctionData = createdPermissions
    .filter((perm) => teacherPermissions.includes(perm.code))
    .map((perm) => ({
      roleId: teacherRole.id,
      permissionId: perm.id,
    }));
  await prisma.rolePermission.createMany({ data: teacherJunctionData });

  // Student role maps to student permissions
  const studentJunctionData = createdPermissions
    .filter((perm) => studentPermissions.includes(perm.code))
    .map((perm) => ({
      roleId: studentRole.id,
      permissionId: perm.id,
    }));
  await prisma.rolePermission.createMany({ data: studentJunctionData });

  console.log('✅ Role-Permission mappings seeded.');

  // 5. Create default Administrator User Account
  const defaultAdminEmail = 'admin@deukhuri.edu';
  const hashedPassword = await bcrypt.hash('Password123', 12);

  await prisma.user.create({
    data: {
      email: defaultAdminEmail,
      password: hashedPassword,
      fullName: 'System Administrator',
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`👤 System administrator account created: ${defaultAdminEmail} / Password123`);
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
