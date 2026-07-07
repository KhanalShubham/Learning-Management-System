import { prisma } from '@/prisma/client';
import { ClassSubject, Prisma } from '@prisma/client';

export interface IClassSubjectRepository {
  create(data: Prisma.ClassSubjectCreateInput): Promise<ClassSubject>;
  findById(id: string): Promise<ClassSubject | null>;
  findByClassAndSubject(classId: string, subjectId: string): Promise<ClassSubject | null>;
  findAll(classId?: string): Promise<ClassSubject[]>;
  update(id: string, data: Prisma.ClassSubjectUpdateInput): Promise<ClassSubject>;
  delete(id: string): Promise<ClassSubject>;
}

export class ClassSubjectRepository implements IClassSubjectRepository {
  public async create(data: Prisma.ClassSubjectCreateInput): Promise<ClassSubject> {
    return prisma.classSubject.create({ data, include: { subject: true, class: true } });
  }

  public async findById(id: string): Promise<ClassSubject | null> {
    return prisma.classSubject.findUnique({
      where: { id },
      include: { subject: true, class: true },
    });
  }

  public async findByClassAndSubject(
    classId: string,
    subjectId: string
  ): Promise<ClassSubject | null> {
    return prisma.classSubject.findUnique({
      where: { classId_subjectId: { classId, subjectId } },
    });
  }

  public async findAll(classId?: string): Promise<ClassSubject[]> {
    return prisma.classSubject.findMany({
      where: classId ? { classId } : undefined,
      include: { subject: true, class: true },
      orderBy: { subject: { name: 'asc' } },
    });
  }

  public async update(id: string, data: Prisma.ClassSubjectUpdateInput): Promise<ClassSubject> {
    return prisma.classSubject.update({
      where: { id },
      data,
      include: { subject: true, class: true },
    });
  }

  public async delete(id: string): Promise<ClassSubject> {
    return prisma.classSubject.delete({ where: { id } });
  }
}
