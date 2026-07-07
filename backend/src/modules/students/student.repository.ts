import { prisma } from '@/prisma/client';
import {
  Student,
  Enrollment,
  StudentGuardian,
  StudentDocument,
  StudentStatus,
  GuardianRelation,
  StudentDocumentType,
  Prisma,
} from '@prisma/client';

export type StudentWithRelations = Student & {
  enrollments: Enrollment[];
  guardians: StudentGuardian[];
  documents: StudentDocument[];
};

export interface GuardianInput {
  relation: GuardianRelation;
  fullName: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
}

export interface DocumentInput {
  documentType: StudentDocumentType;
  fileUrl: string;
}

export interface AdmitStudentData {
  academicYearId: string;
  classId: string;
  sectionId: string;
  rollNumber?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl?: string;
  address?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  temporaryAddress?: string;
  temporaryProvince?: string;
  temporaryDistrict?: string;
  temporaryMunicipality?: string;
  temporaryWard?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  previousSchoolName?: string;
  previousSchoolBoard?: string;
  lastClassCompleted?: string;
  transferCertificateNumber?: string;
  feeCategory?: string;
  guardians: GuardianInput[];
  documents: DocumentInput[];
}

export interface ListStudentsFilters {
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  status?: StudentStatus;
  search?: string;
  skip?: number;
  take?: number;
}

export interface IStudentRepository {
  admit(data: AdmitStudentData, admissionNumberPrefix: string): Promise<StudentWithRelations>;
  findById(id: string): Promise<StudentWithRelations | null>;
  findAll(filters: ListStudentsFilters): Promise<{ data: Student[]; total: number }>;
  update(id: string, data: Prisma.StudentUpdateInput): Promise<Student>;
  updateStatus(id: string, status: StudentStatus): Promise<Student>;
  delete(id: string): Promise<Student>;
  findGuardianByRelation(
    studentId: string,
    relation: GuardianRelation
  ): Promise<StudentGuardian | null>;
  addGuardian(studentId: string, data: GuardianInput): Promise<StudentGuardian>;
  updateGuardian(
    guardianId: string,
    data: Partial<Omit<GuardianInput, 'relation'>>
  ): Promise<StudentGuardian>;
  deleteGuardian(guardianId: string): Promise<StudentGuardian>;
  addDocument(studentId: string, data: DocumentInput): Promise<StudentDocument>;
  deleteDocument(documentId: string): Promise<StudentDocument>;
}

export class StudentRepository implements IStudentRepository {
  // Increments the per-academic-year sequence and creates the Student, its
  // first Enrollment, guardians, and documents in one transaction, so
  // concurrent admissions can't collide on the same admission number.
  public async admit(
    data: AdmitStudentData,
    admissionNumberPrefix: string
  ): Promise<StudentWithRelations> {
    const {
      guardians,
      documents,
      academicYearId,
      classId,
      sectionId,
      rollNumber,
      ...profile
    } = data;

    return prisma.$transaction(async (tx) => {
      const sequence = await tx.admissionNumberSequence.upsert({
        where: { academicYearId },
        update: { lastNumber: { increment: 1 } },
        create: { academicYearId, lastNumber: 1 },
      });

      const admissionNumber = `${admissionNumberPrefix}-${String(sequence.lastNumber).padStart(4, '0')}`;

      return tx.student.create({
        data: {
          ...profile,
          admissionNumber,
          guardians: { create: guardians },
          documents: { create: documents },
          enrollments: {
            create: [
              {
                academicYear: { connect: { id: academicYearId } },
                class: { connect: { id: classId } },
                section: { connect: { id: sectionId } },
                rollNumber,
              },
            ],
          },
        },
        include: { enrollments: true, guardians: true, documents: true },
      });
    });
  }

  public async findById(id: string): Promise<StudentWithRelations | null> {
    return prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: { orderBy: { enrolledAt: 'desc' } },
        guardians: true,
        documents: true,
      },
    });
  }

  public async findAll(filters: ListStudentsFilters): Promise<{ data: Student[]; total: number }> {
    const { academicYearId, classId, sectionId, status, search, skip = 0, take = 20 } = filters;

    const enrollmentFilter =
      academicYearId || classId || sectionId
        ? {
            some: {
              ...(academicYearId ? { academicYearId } : {}),
              ...(classId ? { classId } : {}),
              ...(sectionId ? { sectionId } : {}),
            },
          }
        : undefined;

    const where: Prisma.StudentWhereInput = {
      ...(enrollmentFilter ? { enrollments: enrollmentFilter } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { admissionNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.student.findMany({ where, skip, take, orderBy: { admissionDate: 'desc' } }),
      prisma.student.count({ where }),
    ]);

    return { data, total };
  }

  public async update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    return prisma.student.update({ where: { id }, data });
  }

  public async updateStatus(id: string, status: StudentStatus): Promise<Student> {
    return prisma.student.update({ where: { id }, data: { status } });
  }

  public async delete(id: string): Promise<Student> {
    return prisma.student.delete({ where: { id } });
  }

  public async findGuardianByRelation(
    studentId: string,
    relation: GuardianRelation
  ): Promise<StudentGuardian | null> {
    return prisma.studentGuardian.findUnique({
      where: { studentId_relation: { studentId, relation } },
    });
  }

  public async addGuardian(studentId: string, data: GuardianInput): Promise<StudentGuardian> {
    return prisma.studentGuardian.create({ data: { ...data, studentId } });
  }

  public async updateGuardian(
    guardianId: string,
    data: Partial<Omit<GuardianInput, 'relation'>>
  ): Promise<StudentGuardian> {
    return prisma.studentGuardian.update({ where: { id: guardianId }, data });
  }

  public async deleteGuardian(guardianId: string): Promise<StudentGuardian> {
    return prisma.studentGuardian.delete({ where: { id: guardianId } });
  }

  public async addDocument(studentId: string, data: DocumentInput): Promise<StudentDocument> {
    return prisma.studentDocument.create({ data: { ...data, studentId } });
  }

  public async deleteDocument(documentId: string): Promise<StudentDocument> {
    return prisma.studentDocument.delete({ where: { id: documentId } });
  }
}
