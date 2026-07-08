import { AuditAction } from '@prisma/client';
import { prisma } from '@/prisma/client';

/**
 * Shared audit-log writer — not owned by any single engine's repository,
 * since AuditLog is a cross-cutting compliance record any module can append to.
 */
export async function writeAuditLog(data: {
  userId?: string;
  email?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}) {
  return prisma.auditLog.create({
    data: {
      userId: data.userId || null,
      email: data.email || null,
      action: data.action,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      details: data.details || null,
    },
  });
}
