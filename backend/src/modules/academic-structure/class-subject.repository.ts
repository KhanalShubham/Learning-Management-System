import { prisma } from '@/prisma/client';
import { ClassSubject, Prisma } from '@prisma/client';

// Additive, nullable-only include — a ClassSubject with no assigned teacher
// yet is valid (see docs/architecture/faculty-engine-design-spec.md §8 edge
// case 5). Owned here (Academic Engine), never redefined by Faculty.
const classSubjectInclude = {
  subject: true,
  class: true,
  teacher: { select: { id: true, employeeId: true, firstName: true, lastName: true } },
} satisfies Prisma.ClassSubjectInclude;

export interface IClassSubjectRepository {
  create(data: Prisma.ClassSubjectCreateInput): Promise<ClassSubject>;
  findById(id: string): Promise<ClassSubject | null>;
  findByClassAndSubject(classId: string, subjectId: string): Promise<ClassSubject | null>;
  findAll(classId?: string): Promise<ClassSubject[]>;
  update(id: string, data: Prisma.ClassSubjectUpdateInput): Promise<ClassSubject>;
  assignTeacher(id: string, teacherId: string | null): Promise<ClassSubject>;
  delete(id: string): Promise<ClassSubject>;
}

export class ClassSubjectRepository implements IClassSubjectRepository {
  public async create(data: Prisma.ClassSubjectCreateInput): Promise<ClassSubject> {
    return prisma.classSubject.create({ data, include: classSubjectInclude });
  }

  public async findById(id: string): Promise<ClassSubject | null> {
    return prisma.classSubject.findUnique({
      where: { id },
      include: classSubjectInclude,
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
      include: classSubjectInclude,
      orderBy: { subject: { name: 'asc' } },
    });
  }

  public async update(id: string, data: Prisma.ClassSubjectUpdateInput): Promise<ClassSubject> {
    return prisma.classSubject.update({
      where: { id },
      data,
      include: classSubjectInclude,
    });
  }

  public async assignTeacher(id: string, teacherId: string | null): Promise<ClassSubject> {
    return prisma.classSubject.update({
      where: { id },
      data: { teacherId },
      include: classSubjectInclude,
    });
  }

  public async delete(id: string): Promise<ClassSubject> {
    return prisma.classSubject.delete({ where: { id } });
  }
}
