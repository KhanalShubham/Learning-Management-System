import { prisma } from '@/prisma/client';
import { UserStatus, AuditAction } from '@prisma/client';

/**
 * Mapped User Profile payload returned by lookup queries.
 */
export interface MappedUserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  status: UserStatus;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface contract declaring database query operations for the auth module.
 */
export interface IAuthRepository {
  /**
   * Find user details by email address, including roles and permission code keys.
   */
  findByEmail(email: string): Promise<MappedUserProfile | null>;

  /**
   * Find user details by ID, including roles and permission code keys.
   */
  findById(id: string): Promise<MappedUserProfile | null>;

  /**
   * Record a new active user refresh token session.
   */
  createSession(data: {
    userId: string;
    token: string;
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    expiresAt: Date;
  }): Promise<any>;

  /**
   * Look up a refresh token record to verify its validation state.
   */
  findSessionByToken(token: string): Promise<any>;

  /**
   * Revoke a specific active session.
   */
  revokeSession(tokenId: string): Promise<any>;

  /**
   * Revoke all sessions registered to a user account.
   */
  revokeAllUserSessions(userId: string): Promise<any>;

  /**
   * Append a security audit log event record.
   */
  writeAuditLog(data: {
    userId?: string;
    email?: string;
    action: AuditAction;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
  }): Promise<any>;

  /**
   * Fetch all active sessions for a user.
   */
  getUserSessions(userId: string): Promise<any[]>;
}

export class AuthRepository implements IAuthRepository {
  /**
   * Flattens database role-permission models into a clean mapped profile object.
   */
  private mapDbUser(user: any): MappedUserProfile | null {
    if (!user) return null;

    // Flatten junction permission models into string codes array
    const permissions = user.role.permissions.map((rp: any) => rp.permission.code);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      permissions,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Find a user by email, flattening linked role permissions.
   */
  public async findByEmail(email: string): Promise<MappedUserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return this.mapDbUser(user);
  }

  /**
   * Find a user by ID, flattening linked role permissions.
   */
  public async findById(id: string): Promise<MappedUserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return this.mapDbUser(user);
  }

  /**
   * Record a new refresh token session.
   */
  public async createSession(data: {
    userId: string;
    token: string;
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    expiresAt: Date;
  }): Promise<any> {
    return prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        userAgent: data.userAgent || null,
        ipAddress: data.ipAddress || null,
        deviceType: data.deviceType || null,
        expiresAt: data.expiresAt,
      },
    });
  }

  /**
   * Query details of a refresh token.
   */
  public async findSessionByToken(token: string): Promise<any> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Mark a session token as revoked.
   */
  public async revokeSession(tokenId: string): Promise<any> {
    return prisma.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });
  }

  /**
   * Bulk revoke all session tokens for a user.
   */
  public async revokeAllUserSessions(userId: string): Promise<any> {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Write a security compliance audit record.
   */
  public async writeAuditLog(data: {
    userId?: string;
    email?: string;
    action: AuditAction;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
  }): Promise<any> {
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

  /**
   * Fetch all active sessions for a user account.
   */
  public async getUserSessions(userId: string): Promise<any[]> {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
