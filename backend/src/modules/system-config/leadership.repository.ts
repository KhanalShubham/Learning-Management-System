import { prisma } from '@/prisma/client';
import { Leadership, LeadershipRole, Prisma } from '@prisma/client';

const ALL_ROLES: LeadershipRole[] = [
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'ADMINISTRATOR',
  'ACCOUNT_OFFICER',
];

export interface ILeadershipRepository {
  getAll(): Promise<Leadership[]>;
  findByRole(role: LeadershipRole): Promise<Leadership | null>;
  upsertByRole(role: LeadershipRole, data: Prisma.LeadershipUpdateInput): Promise<Leadership>;
  updateImage(
    role: LeadershipRole,
    field: 'photoUrl' | 'signatureUrl',
    url: string
  ): Promise<Leadership>;
}

export class LeadershipRepository implements ILeadershipRepository {
  public async getAll(): Promise<Leadership[]> {
    const existing = await prisma.leadership.findMany();
    const existingRoles = new Set(existing.map((entry) => entry.role));
    const missingRoles = ALL_ROLES.filter((role) => !existingRoles.has(role));

    if (missingRoles.length > 0) {
      await prisma.leadership.createMany({
        data: missingRoles.map((role) => ({ role })),
        skipDuplicates: true,
      });
      return prisma.leadership.findMany();
    }

    return existing;
  }

  public async findByRole(role: LeadershipRole): Promise<Leadership | null> {
    return prisma.leadership.findUnique({ where: { role } });
  }

  public async upsertByRole(
    role: LeadershipRole,
    data: Prisma.LeadershipUpdateInput
  ): Promise<Leadership> {
    return prisma.leadership.upsert({
      where: { role },
      create: { role, ...data } as Prisma.LeadershipCreateInput,
      update: data,
    });
  }

  public async updateImage(
    role: LeadershipRole,
    field: 'photoUrl' | 'signatureUrl',
    url: string
  ): Promise<Leadership> {
    return prisma.leadership.upsert({
      where: { role },
      create: { role, [field]: url },
      update: { [field]: url },
    });
  }
}
