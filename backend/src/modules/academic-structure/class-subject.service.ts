import { ClassSubject } from '@prisma/client';
import { IClassSubjectRepository } from './class-subject.repository';
import { AppError } from '@/middleware/error.middleware';
import { validateMarksConsistency } from './class-subject.validator';
import { ITeacherRepository } from '@/modules/faculty/teacher.repository';

export interface CreateClassSubjectInput {
  classId: string;
  subjectId: string;
  fullMarks: number;
  passMarks: number;
  hasPractical: boolean;
  theoryMarks?: number;
  practicalMarks?: number;
  practicalPassMarks?: number;
}

export interface UpdateClassSubjectInput {
  fullMarks?: number;
  passMarks?: number;
  hasPractical?: boolean;
  theoryMarks?: number | null;
  practicalMarks?: number | null;
  practicalPassMarks?: number | null;
}

export class ClassSubjectService {
  // Composes the Faculty Engine's ITeacherRepository for assignTeacher()'s
  // cross-engine validation — the same downstream-composes-upstream pattern
  // as Student Admission validating Class/Section via the Academic Engine's
  // own repositories (see docs/architecture/ADR-005, principle 7).
  constructor(
    private classSubjectRepository: IClassSubjectRepository,
    private teacherRepository: ITeacherRepository
  ) {}

  public async createClassSubject(data: CreateClassSubjectInput): Promise<ClassSubject> {
    const existing = await this.classSubjectRepository.findByClassAndSubject(
      data.classId,
      data.subjectId
    );
    if (existing) {
      throw new AppError('This subject is already allocated to this class', 409);
    }

    const { classId, subjectId, ...rest } = data;
    return this.classSubjectRepository.create({
      ...rest,
      class: { connect: { id: classId } },
      subject: { connect: { id: subjectId } },
    });
  }

  public async getClassSubjectById(id: string): Promise<ClassSubject> {
    const classSubject = await this.classSubjectRepository.findById(id);
    if (!classSubject) {
      throw new AppError('Class subject not found', 404);
    }
    return classSubject;
  }

  public async getAllClassSubjects(classId?: string): Promise<ClassSubject[]> {
    return this.classSubjectRepository.findAll(classId);
  }

  public async updateClassSubject(
    id: string,
    data: UpdateClassSubjectInput
  ): Promise<ClassSubject> {
    const classSubject = await this.getClassSubjectById(id);

    const merged = {
      fullMarks: data.fullMarks ?? classSubject.fullMarks,
      passMarks: data.passMarks ?? classSubject.passMarks,
      hasPractical: data.hasPractical ?? classSubject.hasPractical,
      theoryMarks: data.theoryMarks !== undefined ? data.theoryMarks : classSubject.theoryMarks,
      practicalMarks:
        data.practicalMarks !== undefined ? data.practicalMarks : classSubject.practicalMarks,
      practicalPassMarks:
        data.practicalPassMarks !== undefined
          ? data.practicalPassMarks
          : classSubject.practicalPassMarks,
    };

    const result = validateMarksConsistency(merged);
    if (!result.valid) {
      throw new AppError(result.message ?? 'Invalid marks configuration', 400);
    }

    return this.classSubjectRepository.update(id, merged);
  }

  public async deleteClassSubject(id: string): Promise<ClassSubject> {
    await this.getClassSubjectById(id);
    return this.classSubjectRepository.delete(id);
  }

  // teacherId: null unassigns — a ClassSubject with no teacher is valid
  // (see docs/architecture/faculty-engine-design-spec.md §8 edge case 5).
  public async assignTeacher(id: string, teacherId: string | null): Promise<ClassSubject> {
    await this.getClassSubjectById(id);

    if (teacherId !== null) {
      const teacher = await this.teacherRepository.findById(teacherId);
      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }
      if (teacher.status !== 'ACTIVE') {
        throw new AppError('Only an active teacher can be assigned to a subject', 409);
      }
    }

    return this.classSubjectRepository.assignTeacher(id, teacherId);
  }
}
