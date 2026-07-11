import { prisma } from '@/prisma/client';
import {
  Teacher,
  TeacherQualification,
  TeacherEmergencyContact,
  TeacherDocument,
  TeacherLeaveBalance,
  TeacherStatus,
  TeacherDocumentType,
  EmploymentType,
  Prisma,
} from '@prisma/client';

export type TeacherWithRelations = Teacher & {
  department: { id: string; name: string };
  designation: { id: string; name: string };
  qualifications: TeacherQualification[];
  emergencyContacts: TeacherEmergencyContact[];
  documents: TeacherDocument[];
  leaveBalance: TeacherLeaveBalance | null;
};

export type TeacherListItem = Teacher & {
  department: { id: string; name: string };
  designation: { id: string; name: string };
};

export interface QualificationInput {
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  yearCompleted: number;
}

export interface EmergencyContactInput {
  name: string;
  relation: string;
  phone: string;
  isPrimary?: boolean;
}

export interface DocumentInput {
  documentType: TeacherDocumentType;
  fileUrl: string;
}

export interface RegisterTeacherData {
  departmentId: string;
  designationId: string;
  employmentType: EmploymentType;
  joiningDate: Date;

  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl?: string;
  bloodGroup?: string;

  phone: string;
  email?: string;

  address?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;

  basicSalary?: number;

  qualifications: QualificationInput[];
  emergencyContacts: EmergencyContactInput[];
  documents: DocumentInput[];
}

export interface ListTeachersFilters {
  departmentId?: string;
  designationId?: string;
  status?: TeacherStatus;
  employmentType?: EmploymentType;
  search?: string;
  skip?: number;
  take?: number;
}

export interface TeacherSummary {
  total: number;
  active: number;
  onLeave: number;
  suspended: number;
  terminal: number;
  joinedThisMonth: number;
}

const relationsInclude = {
  department: { select: { id: true, name: true } },
  designation: { select: { id: true, name: true } },
  qualifications: true,
  emergencyContacts: true,
  documents: true,
  leaveBalance: true,
} satisfies Prisma.TeacherInclude;

export interface ITeacherRepository {
  register(data: RegisterTeacherData, employeeIdPrefix: string): Promise<TeacherWithRelations>;
  findById(id: string): Promise<TeacherWithRelations | null>;
  findByPhoneOrEmail(phone: string, email?: string | null): Promise<Teacher | null>;
  findAll(filters: ListTeachersFilters): Promise<{ data: TeacherListItem[]; total: number }>;
  getSummary(): Promise<TeacherSummary>;
  update(id: string, data: Prisma.TeacherUpdateInput): Promise<Teacher>;
  updateStatus(id: string, status: TeacherStatus, leavingDate: Date | null): Promise<Teacher>;
  delete(id: string): Promise<Teacher>;
  countClassSubjects(id: string): Promise<number>;

  addQualification(teacherId: string, data: QualificationInput): Promise<TeacherQualification>;
  findQualificationById(qualificationId: string): Promise<TeacherQualification | null>;
  deleteQualification(qualificationId: string): Promise<TeacherQualification>;

  findEmergencyContactById(contactId: string): Promise<TeacherEmergencyContact | null>;
  countEmergencyContacts(teacherId: string): Promise<number>;
  addEmergencyContact(teacherId: string, data: EmergencyContactInput): Promise<TeacherEmergencyContact>;
  updateEmergencyContact(
    contactId: string,
    data: Partial<EmergencyContactInput>
  ): Promise<TeacherEmergencyContact>;
  unsetPrimaryContacts(teacherId: string): Promise<void>;
  deleteEmergencyContact(contactId: string): Promise<TeacherEmergencyContact>;

  addDocument(teacherId: string, data: DocumentInput): Promise<TeacherDocument>;
  findDocumentById(documentId: string): Promise<TeacherDocument | null>;
  deleteDocument(documentId: string): Promise<TeacherDocument>;

  getLeaveBalance(teacherId: string): Promise<TeacherLeaveBalance | null>;
  adjustLeaveBalance(
    teacherId: string,
    data: Partial<
      Pick<
        TeacherLeaveBalance,
        'annualEntitlement' | 'sickEntitlement' | 'casualEntitlement' | 'annualUsed' | 'sickUsed' | 'casualUsed'
      >
    >
  ): Promise<TeacherLeaveBalance>;
}

export class TeacherRepository implements ITeacherRepository {
  // Increments the global employee-number sequence and creates the Teacher,
  // its qualifications, emergency contacts, documents, and a zero-balance
  // leave ledger in one transaction — same collision-safe shape as
  // StudentRepository.admit.
  public async register(
    data: RegisterTeacherData,
    employeeIdPrefix: string
  ): Promise<TeacherWithRelations> {
    const { qualifications, emergencyContacts, documents, ...profile } = data;

    return prisma.$transaction(async (tx) => {
      const sequence = await tx.employeeNumberSequence.upsert({
        where: { id: 'singleton' },
        update: { lastNumber: { increment: 1 } },
        create: { id: 'singleton', lastNumber: 1 },
      });

      const employeeId = `${employeeIdPrefix}-${String(sequence.lastNumber).padStart(4, '0')}`;

      return tx.teacher.create({
        data: {
          ...profile,
          employeeId,
          qualifications: { create: qualifications },
          emergencyContacts: { create: emergencyContacts },
          documents: { create: documents },
          leaveBalance: { create: {} },
        },
        include: relationsInclude,
      });
    });
  }

  public async findById(id: string): Promise<TeacherWithRelations | null> {
    return prisma.teacher.findUnique({ where: { id }, include: relationsInclude });
  }

  public async findByPhoneOrEmail(phone: string, email?: string | null): Promise<Teacher | null> {
    return prisma.teacher.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });
  }

  public async findAll(
    filters: ListTeachersFilters
  ): Promise<{ data: TeacherListItem[]; total: number }> {
    const { departmentId, designationId, status, employmentType, search, skip = 0, take = 20 } = filters;

    const where: Prisma.TeacherWhereInput = {
      ...(departmentId ? { departmentId } : {}),
      ...(designationId ? { designationId } : {}),
      ...(status ? { status } : {}),
      ...(employmentType ? { employmentType } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { employeeId: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, name: true } },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    return { data, total };
  }

  public async getSummary(): Promise<TeacherSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, onLeave, suspended, terminal, joinedThisMonth] = await Promise.all([
      prisma.teacher.count(),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { status: 'ON_LEAVE' } }),
      prisma.teacher.count({ where: { status: 'SUSPENDED' } }),
      prisma.teacher.count({ where: { status: { in: ['RESIGNED', 'TERMINATED', 'RETIRED'] } } }),
      prisma.teacher.count({ where: { joiningDate: { gte: startOfMonth } } }),
    ]);

    return { total, active, onLeave, suspended, terminal, joinedThisMonth };
  }

  public async update(id: string, data: Prisma.TeacherUpdateInput): Promise<Teacher> {
    return prisma.teacher.update({ where: { id }, data });
  }

  public async updateStatus(
    id: string,
    status: TeacherStatus,
    leavingDate: Date | null
  ): Promise<Teacher> {
    return prisma.teacher.update({ where: { id }, data: { status, leavingDate } });
  }

  public async delete(id: string): Promise<Teacher> {
    return prisma.teacher.delete({ where: { id } });
  }

  public async countClassSubjects(id: string): Promise<number> {
    return prisma.classSubject.count({ where: { teacherId: id } });
  }

  public async addQualification(
    teacherId: string,
    data: QualificationInput
  ): Promise<TeacherQualification> {
    return prisma.teacherQualification.create({ data: { ...data, teacherId } });
  }

  public async findQualificationById(qualificationId: string): Promise<TeacherQualification | null> {
    return prisma.teacherQualification.findUnique({ where: { id: qualificationId } });
  }

  public async deleteQualification(qualificationId: string): Promise<TeacherQualification> {
    return prisma.teacherQualification.delete({ where: { id: qualificationId } });
  }

  public async findEmergencyContactById(contactId: string): Promise<TeacherEmergencyContact | null> {
    return prisma.teacherEmergencyContact.findUnique({ where: { id: contactId } });
  }

  public async countEmergencyContacts(teacherId: string): Promise<number> {
    return prisma.teacherEmergencyContact.count({ where: { teacherId } });
  }

  public async addEmergencyContact(
    teacherId: string,
    data: EmergencyContactInput
  ): Promise<TeacherEmergencyContact> {
    return prisma.teacherEmergencyContact.create({ data: { ...data, teacherId } });
  }

  public async updateEmergencyContact(
    contactId: string,
    data: Partial<EmergencyContactInput>
  ): Promise<TeacherEmergencyContact> {
    return prisma.teacherEmergencyContact.update({ where: { id: contactId }, data });
  }

  // Clears isPrimary on every existing contact — called before setting a new
  // primary so exactly one stays true (service-layer enforced cardinality,
  // see teacher.service.ts).
  public async unsetPrimaryContacts(teacherId: string): Promise<void> {
    await prisma.teacherEmergencyContact.updateMany({
      where: { teacherId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  public async deleteEmergencyContact(contactId: string): Promise<TeacherEmergencyContact> {
    return prisma.teacherEmergencyContact.delete({ where: { id: contactId } });
  }

  public async addDocument(teacherId: string, data: DocumentInput): Promise<TeacherDocument> {
    return prisma.teacherDocument.create({ data: { ...data, teacherId } });
  }

  public async findDocumentById(documentId: string): Promise<TeacherDocument | null> {
    return prisma.teacherDocument.findUnique({ where: { id: documentId } });
  }

  public async deleteDocument(documentId: string): Promise<TeacherDocument> {
    return prisma.teacherDocument.delete({ where: { id: documentId } });
  }

  public async getLeaveBalance(teacherId: string): Promise<TeacherLeaveBalance | null> {
    return prisma.teacherLeaveBalance.findUnique({ where: { teacherId } });
  }

  public async adjustLeaveBalance(
    teacherId: string,
    data: Partial<
      Pick<
        TeacherLeaveBalance,
        'annualEntitlement' | 'sickEntitlement' | 'casualEntitlement' | 'annualUsed' | 'sickUsed' | 'casualUsed'
      >
    >
  ): Promise<TeacherLeaveBalance> {
    return prisma.teacherLeaveBalance.update({ where: { teacherId }, data });
  }
}
