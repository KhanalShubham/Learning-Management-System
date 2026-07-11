import { Teacher, TeacherStatus, Prisma } from '@prisma/client';
import { AppError } from '@/middleware/error.middleware';
import {
  ITeacherRepository,
  RegisterTeacherData,
  ListTeachersFilters,
  TeacherWithRelations,
  TeacherListItem,
  TeacherSummary,
  QualificationInput,
  EmergencyContactInput,
  DocumentInput,
} from './teacher.repository';
import { IDepartmentRepository } from './department.repository';
import { IDesignationRepository } from './designation.repository';
import { ISchoolProfileRepository } from '@/modules/system-config/school-profile.repository';

const DEFAULT_SCHOOL_SHORT_CODE = 'SCH';
const TERMINAL_STATUSES: TeacherStatus[] = ['RESIGNED', 'TERMINATED', 'RETIRED'];
const MIN_AGE_AT_JOINING = 18;

type TeacherWithoutSalary = Omit<TeacherWithRelations, 'basicSalary'>;
type TeacherListItemWithoutSalary = Omit<TeacherListItem, 'basicSalary'>;

export class TeacherService {
  constructor(
    private teacherRepository: ITeacherRepository,
    private departmentRepository: IDepartmentRepository,
    private designationRepository: IDesignationRepository,
    private schoolProfileRepository: ISchoolProfileRepository
  ) {}

  // Cross-engine-within-engine validation — Department/Designation are this
  // engine's own reference data, but still validated the same way Student
  // Admission validates Class/Section: confirm the target exists and is
  // ACTIVE before writing a Teacher that points at it.
  private async validateEmploymentReferences(departmentId: string, designationId: string) {
    const department = await this.departmentRepository.findById(departmentId);
    if (!department || department.status !== 'ACTIVE') {
      throw new AppError('Department not found or archived', 404);
    }

    const designation = await this.designationRepository.findById(designationId);
    if (!designation || designation.status !== 'ACTIVE') {
      throw new AppError('Designation not found or archived', 404);
    }
  }

  private validateAge(dateOfBirth: Date, joiningDate: Date) {
    const ageAtJoining =
      (joiningDate.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageAtJoining < MIN_AGE_AT_JOINING) {
      throw new AppError(`Teacher must be at least ${MIN_AGE_AT_JOINING} years old at the joining date`, 400);
    }
  }

  private validateJoiningDate(joiningDate: Date) {
    if (joiningDate.getTime() > Date.now()) {
      throw new AppError('Joining date cannot be in the future', 400);
    }
  }

  // Enforces "at most one primary contact" and defaults the first contact to
  // primary if none was marked — friendlier than rejecting a perfectly valid
  // single-contact registration for missing an explicit flag.
  private normalizePrimaryContact(contacts: EmergencyContactInput[]): EmergencyContactInput[] {
    const primaryCount = contacts.filter((c) => c.isPrimary).length;
    if (primaryCount > 1) {
      throw new AppError('Only one emergency contact may be marked as primary', 400);
    }
    if (primaryCount === 0 && contacts.length > 0) {
      return contacts.map((c, i) => (i === 0 ? { ...c, isPrimary: true } : c));
    }
    return contacts;
  }

  private async checkContactDuplicates(phone: string, email: string | undefined, excludeId?: string) {
    const existing = await this.teacherRepository.findByPhoneOrEmail(phone, email);
    if (existing && existing.id !== excludeId) {
      throw new AppError('A teacher with this phone number or email already exists', 409);
    }
  }

  private omitSalary<T extends { basicSalary?: unknown }>(teacher: T): Omit<T, 'basicSalary'> {
    const { basicSalary: _basicSalary, ...rest } = teacher;
    return rest;
  }

  public async registerTeacher(
    data: RegisterTeacherData,
    canSetSalary: boolean
  ): Promise<TeacherWithoutSalary | TeacherWithRelations> {
    await this.validateEmploymentReferences(data.departmentId, data.designationId);
    this.validateAge(data.dateOfBirth, data.joiningDate);
    this.validateJoiningDate(data.joiningDate);
    await this.checkContactDuplicates(data.phone, data.email);

    const emergencyContacts = this.normalizePrimaryContact(data.emergencyContacts);
    const basicSalary = canSetSalary ? data.basicSalary : undefined;

    const schoolProfile = await this.schoolProfileRepository.getOrCreate();
    const shortCode = schoolProfile.shortName || DEFAULT_SCHOOL_SHORT_CODE;
    const employeeIdPrefix = `${shortCode}-EMP`;

    try {
      const teacher = await this.teacherRepository.register(
        { ...data, emergencyContacts, basicSalary },
        employeeIdPrefix
      );
      return canSetSalary ? teacher : this.omitSalary(teacher);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('A teacher with this phone number or email already exists', 409);
      }
      throw error;
    }
  }

  private async findTeacherOrThrow(id: string): Promise<TeacherWithRelations> {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }
    return teacher;
  }

  public async getTeacherById(id: string, canSeeSalary: boolean): Promise<TeacherWithoutSalary | TeacherWithRelations> {
    const teacher = await this.findTeacherOrThrow(id);
    return canSeeSalary ? teacher : this.omitSalary(teacher);
  }

  public async getAllTeachers(
    filters: ListTeachersFilters,
    canSeeSalary: boolean
  ): Promise<{ data: (TeacherListItemWithoutSalary | TeacherListItem)[]; total: number }> {
    const result = await this.teacherRepository.findAll(filters);
    if (canSeeSalary) return result;
    return { ...result, data: result.data.map((t) => this.omitSalary(t)) };
  }

  public async getSummary(): Promise<TeacherSummary> {
    return this.teacherRepository.getSummary();
  }

  public async updateTeacher(
    id: string,
    data: Prisma.TeacherUpdateInput & { phone?: string; email?: string | null },
    canSetSalary: boolean
  ): Promise<Omit<Teacher, 'basicSalary'> | Teacher> {
    await this.findTeacherOrThrow(id);

    if (data.phone) {
      await this.checkContactDuplicates(
        data.phone as string,
        data.email !== undefined ? ((data.email as string) ?? undefined) : undefined,
        id
      );
    }

    const payload = { ...data };
    if (!canSetSalary) {
      delete payload.basicSalary;
    }

    const updated = await this.teacherRepository.update(id, payload);
    return canSetSalary ? updated : this.omitSalary(updated);
  }

  // Any transition into or out of a terminal status (RESIGNED/TERMINATED/
  // RETIRED) requires teachers.archive — including the ACTIVE-again rehire
  // case, since reopening a terminated record is as sensitive as closing one.
  // Transitions purely among ACTIVE/ON_LEAVE/SUSPENDED only need teachers.update.
  public async updateStatus(
    id: string,
    status: TeacherStatus,
    leavingDateInput: Date | undefined,
    canArchive: boolean
  ): Promise<Teacher> {
    const teacher = await this.findTeacherOrThrow(id);

    const targetIsTerminal = TERMINAL_STATUSES.includes(status);
    const currentIsTerminal = TERMINAL_STATUSES.includes(teacher.status);

    if ((targetIsTerminal || currentIsTerminal) && !canArchive) {
      throw new AppError('Permission denied: teachers.archive is required for this status change', 403);
    }

    const leavingDate = targetIsTerminal ? (leavingDateInput ?? new Date()) : null;
    return this.teacherRepository.updateStatus(id, status, leavingDate);
  }

  public async deleteTeacher(id: string): Promise<Teacher> {
    await this.findTeacherOrThrow(id);
    const assignmentCount = await this.teacherRepository.countClassSubjects(id);
    if (assignmentCount > 0) {
      throw new AppError(
        'Teacher is assigned to one or more subjects; archive the teacher instead of deleting',
        409
      );
    }
    return this.teacherRepository.delete(id);
  }

  public async addQualification(teacherId: string, data: QualificationInput) {
    await this.findTeacherOrThrow(teacherId);
    return this.teacherRepository.addQualification(teacherId, data);
  }

  public async deleteQualification(teacherId: string, qualificationId: string) {
    await this.findTeacherOrThrow(teacherId);
    const qualification = await this.teacherRepository.findQualificationById(qualificationId);
    if (!qualification || qualification.teacherId !== teacherId) {
      throw new AppError('Qualification not found', 404);
    }
    return this.teacherRepository.deleteQualification(qualificationId);
  }

  public async addEmergencyContact(teacherId: string, data: EmergencyContactInput) {
    await this.findTeacherOrThrow(teacherId);
    if (data.isPrimary) {
      await this.teacherRepository.unsetPrimaryContacts(teacherId);
    }
    return this.teacherRepository.addEmergencyContact(teacherId, data);
  }

  public async updateEmergencyContact(
    teacherId: string,
    contactId: string,
    data: Partial<EmergencyContactInput>
  ) {
    await this.findTeacherOrThrow(teacherId);
    const contact = await this.teacherRepository.findEmergencyContactById(contactId);
    if (!contact || contact.teacherId !== teacherId) {
      throw new AppError('Emergency contact not found', 404);
    }
    if (data.isPrimary) {
      await this.teacherRepository.unsetPrimaryContacts(teacherId);
    }
    return this.teacherRepository.updateEmergencyContact(contactId, data);
  }

  public async deleteEmergencyContact(teacherId: string, contactId: string) {
    await this.findTeacherOrThrow(teacherId);
    const contact = await this.teacherRepository.findEmergencyContactById(contactId);
    if (!contact || contact.teacherId !== teacherId) {
      throw new AppError('Emergency contact not found', 404);
    }
    const remaining = await this.teacherRepository.countEmergencyContacts(teacherId);
    if (remaining <= 1) {
      throw new AppError('A teacher must have at least one emergency contact', 409);
    }
    return this.teacherRepository.deleteEmergencyContact(contactId);
  }

  public async addDocument(teacherId: string, data: DocumentInput) {
    await this.findTeacherOrThrow(teacherId);
    return this.teacherRepository.addDocument(teacherId, data);
  }

  public async deleteDocument(teacherId: string, documentId: string) {
    await this.findTeacherOrThrow(teacherId);
    const document = await this.teacherRepository.findDocumentById(documentId);
    if (!document || document.teacherId !== teacherId) {
      throw new AppError('Document not found', 404);
    }
    return this.teacherRepository.deleteDocument(documentId);
  }

  public async getLeaveBalance(teacherId: string) {
    await this.findTeacherOrThrow(teacherId);
    const balance = await this.teacherRepository.getLeaveBalance(teacherId);
    if (!balance) {
      throw new AppError('Leave balance not found for this teacher', 404);
    }
    return balance;
  }

  public async adjustLeaveBalance(
    teacherId: string,
    data: Partial<{
      annualEntitlement: number;
      sickEntitlement: number;
      casualEntitlement: number;
      annualUsed: number;
      sickUsed: number;
      casualUsed: number;
    }>
  ) {
    await this.getLeaveBalance(teacherId);
    return this.teacherRepository.adjustLeaveBalance(teacherId, data);
  }
}
