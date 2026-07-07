import { Prisma } from '@prisma/client';
import { IUserRepository, UserWithoutPassword } from './user.repository';
import bcrypt from 'bcrypt';
import { AppError } from '@/middleware/error.middleware';

export class UserService {
  private saltRounds = 12;

  constructor(private userRepository: IUserRepository) {}

  public async createUser(data: Prisma.UserUncheckedCreateInput): Promise<UserWithoutPassword> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    try {
      return await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Role not found', 400);
      }
      throw error;
    }
  }

  public async getUserById(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  public async getAllUsers(skip?: number, take?: number): Promise<{ data: UserWithoutPassword[], total: number }> {
    return this.userRepository.findAll(skip, take);
  }

  public async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email as string);
      if (existingUser && existingUser.id !== id) {
        throw new AppError('Email is already in use by another account', 409);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, this.saltRounds);
    }

    try {
      return await this.userRepository.update(id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Role not found', 400);
      }
      throw error;
    }
  }

  public async deleteUser(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.userRepository.delete(id);
  }
}
