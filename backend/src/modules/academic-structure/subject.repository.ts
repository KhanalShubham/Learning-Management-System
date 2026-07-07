import { prisma } from '@/prisma/client';
import { Subject, Prisma, RecordStatus } from '@prisma/client';

export interface ISubjectRepository {
  create(data: Prisma.SubjectCreateInput): Promise<Subject>;
  findById(id: string): Promise<Subject | null>;
  findByNameOrCode(name: string, code?: string | null): Promise<Subject | null>;
  findAll(includeArchived?: boolean): Promise<Subject[]>;
  update(id: string, data: Prisma.SubjectUpdateInput): Promise<Subject>;
  archive(id: string): Promise<Subject>;
  delete(id: string): Promise<Subject>;
  countClassSubjects(id: string): Promise<number>;
}

export class SubjectRepository implements ISubjectRepository {
  public async create(data: Prisma.SubjectCreateInput): Promise<Subject> {
    return prisma.subject.create({ data });
  }

  public async findById(id: string): Promise<Subject | null> {
    return prisma.subject.findUnique({ where: { id } });
  }

  public async findByNameOrCode(name: string, code?: string | null): Promise<Subject | null> {
    return prisma.subject.findFirst({
      where: {
        OR: [{ name }, ...(code ? [{ code }] : [])],
      },
    });
  }

  public async findAll(includeArchived = false): Promise<Subject[]> {
    return prisma.subject.findMany({
      where: includeArchived ? undefined : { status: RecordStatus.ACTIVE },
      orderBy: { name: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.SubjectUpdateInput): Promise<Subject> {
    return prisma.subject.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<Subject> {
    return prisma.subject.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<Subject> {
    return prisma.subject.delete({ where: { id } });
  }

  public async countClassSubjects(id: string): Promise<number> {
    return prisma.classSubject.count({ where: { subjectId: id } });
  }
}
