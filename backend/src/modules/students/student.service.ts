import { Student, StudentStatus, Prisma } from '@prisma/client';
import { AppError } from '@/middleware/error.middleware';
import {
  IStudentRepository,
  AdmitStudentData,
  ListStudentsFilters,
  StudentWithRelations,
  GuardianInput,
  DocumentInput,
  StudentSummary,
} from './student.repository';
import { IAcademicYearRepository } from '@/modules/system-config/academic-year.repository';
import { ISchoolProfileRepository } from '@/modules/system-config/school-profile.repository';
import { IClassRepository } from '@/modules/academic-structure/class.repository';
import { ISectionRepository } from '@/modules/academic-structure/section.repository';

// Fallback used only if the school hasn't set a short code in System
// Configuration yet — admissions shouldn't be blocked on that being set,
// but the admin should be nudged to configure it for a meaningful prefix.
const DEFAULT_SCHOOL_SHORT_CODE = 'SCH';

export class StudentService {
  constructor(
    private studentRepository: IStudentRepository,
    private academicYearRepository: IAcademicYearRepository,
    private schoolProfileRepository: ISchoolProfileRepository,
    private classRepository: IClassRepository,
    private sectionRepository: ISectionRepository
  ) {}

  // Cross-engine reference validation — Student holds FKs into the Academic
  // Engine's data, so admission must confirm those targets actually exist
  // and are consistently nested (class belongs to the year, section to the class).
  private async validateAcademicPlacement(
    academicYearId: string,
    classId: string,
    sectionId: string
  ): Promise<Date> {
    const academicYear = await this.academicYearRepository.findById(academicYearId);
    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    const cls = await this.classRepository.findById(classId);
    if (!cls || cls.academicYearId !== academicYearId) {
      throw new AppError('Class not found for this academic year', 404);
    }

    const section = await this.sectionRepository.findById(sectionId);
    if (!section || section.classId !== classId) {
      throw new AppError('Section not found for this class', 404);
    }

    return academicYear.startDate;
  }

  public async admitStudent(data: AdmitStudentData): Promise<StudentWithRelations> {
    const startDate = await this.validateAcademicPlacement(
      data.academicYearId,
      data.classId,
      data.sectionId
    );

    const schoolProfile = await this.schoolProfileRepository.getOrCreate();
    const shortCode = schoolProfile.shortName || DEFAULT_SCHOOL_SHORT_CODE;
    const admissionNumberPrefix = `${shortCode}-${startDate.getFullYear()}`;

    try {
      return await this.studentRepository.admit(data, admissionNumberPrefix);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(
          'A student with this roll number already exists in this section for this academic year',
          409
        );
      }
      throw error;
    }
  }

  public async getStudentById(id: string): Promise<StudentWithRelations> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new AppError('Student not found', 404);
    }
    return student;
  }

  public async getAllStudents(filters: ListStudentsFilters) {
    return this.studentRepository.findAll(filters);
  }

  public async getSummary(): Promise<StudentSummary> {
    return this.studentRepository.getSummary();
  }

  public async updateStudent(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    await this.getStudentById(id);
    return this.studentRepository.update(id, data);
  }

  public async updateStatus(id: string, status: StudentStatus): Promise<Student> {
    await this.getStudentById(id);
    return this.studentRepository.updateStatus(id, status);
  }

  public async deleteStudent(id: string): Promise<Student> {
    await this.getStudentById(id);
    return this.studentRepository.delete(id);
  }

  public async addGuardian(studentId: string, data: GuardianInput) {
    await this.getStudentById(studentId);
    const existing = await this.studentRepository.findGuardianByRelation(studentId, data.relation);
    if (existing) {
      throw new AppError(
        `A ${data.relation.toLowerCase()} guardian already exists for this student`,
        409
      );
    }
    return this.studentRepository.addGuardian(studentId, data);
  }

  public async updateGuardian(
    studentId: string,
    guardianId: string,
    data: Partial<Omit<GuardianInput, 'relation'>>
  ) {
    await this.getStudentById(studentId);
    return this.studentRepository.updateGuardian(guardianId, data);
  }

  public async deleteGuardian(studentId: string, guardianId: string) {
    await this.getStudentById(studentId);
    return this.studentRepository.deleteGuardian(guardianId);
  }

  public async addDocument(studentId: string, data: DocumentInput) {
    await this.getStudentById(studentId);
    return this.studentRepository.addDocument(studentId, data);
  }

  public async deleteDocument(studentId: string, documentId: string) {
    await this.getStudentById(studentId);
    return this.studentRepository.deleteDocument(documentId);
  }
}
