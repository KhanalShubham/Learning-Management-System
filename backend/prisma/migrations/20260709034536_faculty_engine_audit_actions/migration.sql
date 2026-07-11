-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'TEACHER_LEAVE_BALANCE_ADJUSTED';
ALTER TYPE "AuditAction" ADD VALUE 'DEPARTMENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'DEPARTMENT_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'DEPARTMENT_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE 'DEPARTMENT_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'DESIGNATION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'DESIGNATION_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'DESIGNATION_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE 'DESIGNATION_DELETED';
