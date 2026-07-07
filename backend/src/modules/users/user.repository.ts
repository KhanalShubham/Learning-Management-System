import { prisma } from '@/prisma/client';
import { User, Prisma } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface IUserRepository {
  create(data: Prisma.UserUncheckedCreateInput): Promise<UserWithoutPassword>;
  findById(id: string): Promise<UserWithoutPassword | null>;
  findByEmail(email: string): Promise<UserWithoutPassword | null>;
  findAll(skip?: number, take?: number): Promise<{ data: UserWithoutPassword[], total: number }>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithoutPassword>;
  delete(id: string): Promise<UserWithoutPassword>;
}

export class UserRepository implements IUserRepository {
  private excludePassword(user: User): UserWithoutPassword {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async create(data: Prisma.UserUncheckedCreateInput): Promise<UserWithoutPassword> {
    const user = await prisma.user.create({ data });
    return this.excludePassword(user);
  }

  public async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.excludePassword(user);
  }

  public async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.excludePassword(user);
  }

  public async findAll(skip: number = 0, take: number = 10): Promise<{ data: UserWithoutPassword[], total: number }> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({ skip, take }),
      prisma.user.count(),
    ]);

    return {
      data: users.map(this.excludePassword),
      total,
    };
  }

  public async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithoutPassword> {
    const user = await prisma.user.update({ where: { id }, data });
    return this.excludePassword(user);
  }

  public async delete(id: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.delete({ where: { id } });
    return this.excludePassword(user);
  }
}
