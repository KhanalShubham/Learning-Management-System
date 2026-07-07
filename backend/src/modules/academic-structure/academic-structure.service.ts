import { AppError } from '@/middleware/error.middleware';
import { IAcademicStructureRepository } from './academic-structure.repository';

export class AcademicStructureService {
  constructor(private academicStructureRepository: IAcademicStructureRepository) {}

  public async getStructureTree(academicYearId?: string) {
    const academicYear = await this.academicStructureRepository.findAcademicYear(academicYearId);
    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    const [classes, subjects, examTypes] = await Promise.all([
      this.academicStructureRepository.findClassesWithDetails(academicYear.id),
      this.academicStructureRepository.findActiveSubjects(),
      this.academicStructureRepository.findExamTypes(academicYear.id),
    ]);

    const structuredClasses = classes.map(({ classSubjects, ...cls }) => ({
      ...cls,
      sections: cls.sections,
      subjects: classSubjects.map(({ subject, ...classSubject }) => ({
        ...classSubject,
        subject,
      })),
    }));

    const sectionCount = structuredClasses.reduce((sum, cls) => sum + cls.sections.length, 0);
    const classSubjectCount = structuredClasses.reduce((sum, cls) => sum + cls.subjects.length, 0);

    return {
      academicYear,
      summary: {
        classes: structuredClasses.length,
        sections: sectionCount,
        subjects: subjects.length,
        classSubjects: classSubjectCount,
        examTypes: examTypes.length,
      },
      classes: structuredClasses,
      subjects,
      examTypes,
    };
  }
}
