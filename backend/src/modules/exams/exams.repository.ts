import { PrismaClient, ExamTerm, Exam, ExamMark, ExamReportCard, MarksEntryStatus, ExamResultStatus, ResultStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface IExamsRepository {
  createExamTerm(data: { name: string; academicYearId: string; startDate: Date; endDate: Date }): Promise<ExamTerm>;
  findExamTermById(id: string): Promise<ExamTerm | null>;
  findExamTermByNameAndYear(name: string, academicYearId: string): Promise<ExamTerm | null>;
  listExamTerms(academicYearId?: string): Promise<ExamTerm[]>;
  updateExamTerm(id: string, data: Partial<{ name: string; startDate: Date; endDate: Date; status: ExamResultStatus }>): Promise<ExamTerm>;
  
  createExam(data: {
    examTermId: string;
    classSubjectId: string;
    examDate: Date;
    startTime: string;
    endTime: string;
    roomNumber?: string | null;
    theoryMaxMarks: number;
    theoryPassMarks: number;
    practicalMaxMarks: number;
    practicalPassMarks: number;
  }): Promise<Exam>;
  findExamById(id: string): Promise<any | null>;
  findExamByTermAndSubject(examTermId: string, classSubjectId: string): Promise<Exam | null>;
  listExams(filters: { examTermId?: string; classSubjectId?: string; classId?: string }): Promise<any[]>;
  
  findStudentEnrollmentsForClass(classId: string, academicYearId: string): Promise<any[]>;
  findExamMarksForExam(examId: string): Promise<ExamMark[]>;
  bulkUpsertExamMarks(
    examId: string,
    records: Array<{
      studentId: string;
      status: MarksEntryStatus;
      theoryObtained?: number | null;
      practicalObtained?: number | null;
      remarks?: string | null;
    }>,
    enteredById: string
  ): Promise<void>;
  
  findExamReportCard(examTermId: string, studentId: string): Promise<any | null>;
  upsertExamReportCard(data: {
    examTermId: string;
    studentId: string;
    totalMaxMarks: number;
    totalMarksObtained: number;
    percentage: number;
    gpa: number;
    resultStatus: ResultStatus;
    division?: string | null;
    classRank?: number | null;
    sectionRank?: number | null;
    attendanceRate?: number | null;
    remarks?: string | null;
  }): Promise<ExamReportCard>;
  bulkUpsertReportCardDetails(
    reportCardId: string,
    details: Array<{
      subjectId: string;
      theoryObtained?: number | null;
      practicalObtained?: number | null;
      totalObtained: number;
      percentage: number;
      gradePoint: number;
      letterGrade: string;
      status: ResultStatus;
      subjectRank?: number | null;
      remarks?: string | null;
    }>
  ): Promise<void>;
  updateReportCardRanks(updates: Array<{ id: string; classRank?: number | null; sectionRank?: number | null }>): Promise<void>;
  findTermReportCards(termId: string, classId?: string): Promise<any[]>;
}

export class PrismaExamsRepository implements IExamsRepository {
  public async createExamTerm(data: { name: string; academicYearId: string; startDate: Date; endDate: Date }): Promise<ExamTerm> {
    return prisma.examTerm.create({
      data: {
        name: data.name,
        academicYearId: data.academicYearId,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  }

  public async findExamTermById(id: string): Promise<ExamTerm | null> {
    return prisma.examTerm.findUnique({
      where: { id },
      include: { academicYear: true },
    });
  }

  public async findExamTermByNameAndYear(name: string, academicYearId: string): Promise<ExamTerm | null> {
    return prisma.examTerm.findUnique({
      where: {
        academicYearId_name: { academicYearId, name },
      },
    });
  }

  public async listExamTerms(academicYearId?: string): Promise<ExamTerm[]> {
    return prisma.examTerm.findMany({
      where: academicYearId ? { academicYearId } : {},
      orderBy: { startDate: 'desc' },
      include: { academicYear: true },
    });
  }

  public async updateExamTerm(id: string, data: Partial<{ name: string; startDate: Date; endDate: Date; status: ExamResultStatus }>): Promise<ExamTerm> {
    return prisma.examTerm.update({
      where: { id },
      data,
    });
  }

  public async createExam(data: {
    examTermId: string;
    classSubjectId: string;
    examDate: Date;
    startTime: string;
    endTime: string;
    roomNumber?: string | null;
    theoryMaxMarks: number;
    theoryPassMarks: number;
    practicalMaxMarks: number;
    practicalPassMarks: number;
  }): Promise<Exam> {
    return prisma.exam.create({
      data,
    });
  }

  public async findExamById(id: string): Promise<any | null> {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        examTerm: true,
        classSubject: {
          include: {
            class: true,
            subject: true,
          },
        },
      },
    });
  }

  public async findExamByTermAndSubject(examTermId: string, classSubjectId: string): Promise<Exam | null> {
    return prisma.exam.findUnique({
      where: {
        examTermId_classSubjectId: { examTermId, classSubjectId },
      },
    });
  }

  public async listExams(filters: { examTermId?: string; classSubjectId?: string; classId?: string }): Promise<any[]> {
    const whereClause: any = {};
    if (filters.examTermId) {
      whereClause.examTermId = filters.examTermId;
    }
    if (filters.classSubjectId) {
      whereClause.classSubjectId = filters.classSubjectId;
    }
    if (filters.classId) {
      whereClause.classSubject = {
        classId: filters.classId,
      };
    }
    return prisma.exam.findMany({
      where: whereClause,
      include: {
        examTerm: true,
        classSubject: {
          include: {
            class: true,
            subject: true,
          },
        },
      },
      orderBy: { examDate: 'asc' },
    });
  }

  public async findStudentEnrollmentsForClass(classId: string, academicYearId: string): Promise<any[]> {
    return prisma.enrollment.findMany({
      where: {
        classId,
        academicYearId,
      },
      include: {
        student: true,
      },
      orderBy: { rollNumber: 'asc' },
    });
  }

  public async findExamMarksForExam(examId: string): Promise<ExamMark[]> {
    return prisma.examMark.findMany({
      where: { examId },
      include: {
        student: true,
      },
    });
  }

  public async bulkUpsertExamMarks(
    examId: string,
    records: Array<{
      studentId: string;
      status: MarksEntryStatus;
      theoryObtained?: number | null;
      practicalObtained?: number | null;
      remarks?: string | null;
    }>,
    enteredById: string
  ): Promise<void> {
    await prisma.$transaction(
      records.map((rec) =>
        prisma.examMark.upsert({
          where: {
            examId_studentId: { examId, studentId: rec.studentId },
          },
          update: {
            status: rec.status,
            theoryObtained: rec.theoryObtained,
            practicalObtained: rec.practicalObtained,
            remarks: rec.remarks,
            enteredById,
          },
          create: {
            examId,
            studentId: rec.studentId,
            status: rec.status,
            theoryObtained: rec.theoryObtained,
            practicalObtained: rec.practicalObtained,
            remarks: rec.remarks,
            enteredById,
          },
        })
      )
    );
  }

  public async findExamReportCard(examTermId: string, studentId: string): Promise<any | null> {
    return prisma.examReportCard.findUnique({
      where: {
        examTermId_studentId: { examTermId, studentId },
      },
      include: {
        details: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  public async upsertExamReportCard(data: {
    examTermId: string;
    studentId: string;
    totalMaxMarks: number;
    totalMarksObtained: number;
    percentage: number;
    gpa: number;
    resultStatus: ResultStatus;
    division?: string | null;
    classRank?: number | null;
    sectionRank?: number | null;
    attendanceRate?: number | null;
    remarks?: string | null;
  }): Promise<ExamReportCard> {
    return prisma.examReportCard.upsert({
      where: {
        examTermId_studentId: { examTermId: data.examTermId, studentId: data.studentId },
      },
      update: {
        totalMaxMarks: data.totalMaxMarks,
        totalMarksObtained: data.totalMarksObtained,
        percentage: data.percentage,
        gpa: data.gpa,
        resultStatus: data.resultStatus,
        division: data.division,
        classRank: data.classRank,
        sectionRank: data.sectionRank,
        attendanceRate: data.attendanceRate,
        remarks: data.remarks,
      },
      create: {
        examTermId: data.examTermId,
        studentId: data.studentId,
        totalMaxMarks: data.totalMaxMarks,
        totalMarksObtained: data.totalMarksObtained,
        percentage: data.percentage,
        gpa: data.gpa,
        resultStatus: data.resultStatus,
        division: data.division,
        classRank: data.classRank,
        sectionRank: data.sectionRank,
        attendanceRate: data.attendanceRate,
        remarks: data.remarks,
      },
    });
  }

  public async bulkUpsertReportCardDetails(
    reportCardId: string,
    details: Array<{
      subjectId: string;
      theoryObtained?: number | null;
      practicalObtained?: number | null;
      totalObtained: number;
      percentage: number;
      gradePoint: number;
      letterGrade: string;
      status: ResultStatus;
      subjectRank?: number | null;
      remarks?: string | null;
    }>
  ): Promise<void> {
    await prisma.$transaction(
      details.map((det) =>
        prisma.examReportCardDetail.upsert({
          where: {
            reportCardId_subjectId: { reportCardId, subjectId: det.subjectId },
          },
          update: {
            theoryObtained: det.theoryObtained,
            practicalObtained: det.practicalObtained,
            totalObtained: det.totalObtained,
            percentage: det.percentage,
            gradePoint: det.gradePoint,
            letterGrade: det.letterGrade,
            status: det.status,
            subjectRank: det.subjectRank,
            remarks: det.remarks,
          },
          create: {
            reportCardId,
            subjectId: det.subjectId,
            theoryObtained: det.theoryObtained,
            practicalObtained: det.practicalObtained,
            totalObtained: det.totalObtained,
            percentage: det.percentage,
            gradePoint: det.gradePoint,
            letterGrade: det.letterGrade,
            status: det.status,
            subjectRank: det.subjectRank,
            remarks: det.remarks,
          },
        })
      )
    );
  }

  public async updateReportCardRanks(updates: Array<{ id: string; classRank?: number | null; sectionRank?: number | null }>): Promise<void> {
    await prisma.$transaction(
      updates.map((up) =>
        prisma.examReportCard.update({
          where: { id: up.id },
          data: {
            classRank: up.classRank,
            sectionRank: up.sectionRank,
          },
        })
      )
    );
  }

  public async findTermReportCards(termId: string, classId?: string): Promise<any[]> {
    return prisma.examReportCard.findMany({
      where: {
        examTermId: termId,
        student: classId ? {
          enrollments: {
            some: { classId },
          },
        } : undefined,
      },
      include: {
        student: true,
        details: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [
        { classRank: 'asc' },
        { gpa: 'desc' },
      ],
    });
  }
}
