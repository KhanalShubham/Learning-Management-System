import { IExamsRepository } from './exams.repository';
import { ExamTerm, Exam, ExamMark, ExamResultStatus, MarksEntryStatus, ResultStatus } from '@prisma/client';
import { AppError } from '@/middleware/error.middleware';
import { writeAuditLog } from '@/utils/audit-log';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExamsService {
  constructor(private examsRepository: IExamsRepository) {}

  public async createExamTerm(
    data: { name: string; academicYearId: string; startDate: string; endDate: string },
    userId: string
  ): Promise<ExamTerm> {
    // 1. Verify Academic Year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });
    if (!academicYear) {
      throw new AppError('Academic Year not found', 404);
    }

    // 2. Check if name already exists for this Academic Year
    const existing = await this.examsRepository.findExamTermByNameAndYear(data.name, data.academicYearId);
    if (existing) {
      throw new AppError('An exam term with this name already exists in this Academic Year', 409);
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // 3. Verify dates are within the Academic Year boundary
    if (start < academicYear.startDate || end > academicYear.endDate) {
      throw new AppError(
        `Exam term dates must fall within the Academic Year boundaries (${academicYear.startDate.toISOString().split('T')[0]} to ${academicYear.endDate.toISOString().split('T')[0]})`,
        400
      );
    }

    const term = await this.examsRepository.createExamTerm({
      name: data.name,
      academicYearId: data.academicYearId,
      startDate: start,
      endDate: end,
    });

    await writeAuditLog({
      userId,
      action: 'EXAM_TERM_CREATED',
      details: JSON.stringify({ termId: term.id, name: term.name, academicYearId: term.academicYearId }),
    });

    return term;
  }

  public async listExamTerms(academicYearId?: string): Promise<ExamTerm[]> {
    return this.examsRepository.listExamTerms(academicYearId);
  }

  public async createExam(
    data: {
      examTermId: string;
      classSubjectId: string;
      examDate: string;
      startTime: string;
      endTime: string;
      roomNumber?: string | null;
      theoryMaxMarks: number;
      theoryPassMarks: number;
      practicalMaxMarks: number;
      practicalPassMarks: number;
    },
    userId: string
  ): Promise<Exam> {
    // 1. Verify exam term exists
    const examTerm = await this.examsRepository.findExamTermById(data.examTermId);
    if (!examTerm) {
      throw new AppError('Exam term not found', 404);
    }

    // 2. Verify classSubject exists
    const classSubject = await prisma.classSubject.findUnique({
      where: { id: data.classSubjectId },
      include: { class: true, subject: true },
    });
    if (!classSubject) {
      throw new AppError('Class Subject mapping not found', 404);
    }

    // 3. Verify date falls within the term boundary
    const date = new Date(data.examDate);
    if (date < examTerm.startDate || date > examTerm.endDate) {
      throw new AppError(
        `Exam date must fall within the exam term boundaries (${examTerm.startDate.toISOString().split('T')[0]} to ${examTerm.endDate.toISOString().split('T')[0]})`,
        400
      );
    }

    // 4. Verify duplicate scheduling does not exist
    const existing = await this.examsRepository.findExamByTermAndSubject(data.examTermId, data.classSubjectId);
    if (existing) {
      throw new AppError('An exam for this subject is already scheduled in this term', 409);
    }

    const exam = await this.examsRepository.createExam({
      examTermId: data.examTermId,
      classSubjectId: data.classSubjectId,
      examDate: date,
      startTime: data.startTime,
      endTime: data.endTime,
      roomNumber: data.roomNumber,
      theoryMaxMarks: data.theoryMaxMarks,
      theoryPassMarks: data.theoryPassMarks,
      practicalMaxMarks: data.practicalMaxMarks,
      practicalPassMarks: data.practicalPassMarks,
    });

    await writeAuditLog({
      userId,
      action: 'EXAM_SCHEDULED',
      details: JSON.stringify({
        examId: exam.id,
        examTermId: exam.examTermId,
        subjectName: classSubject.subject.name,
        className: classSubject.class.name,
      }),
    });

    return exam;
  }

  public async listExams(filters: { examTermId?: string; classSubjectId?: string; classId?: string }): Promise<Exam[]> {
    return this.examsRepository.listExams(filters);
  }

  public async getExamRoster(examId: string): Promise<any> {
    const exam = await this.examsRepository.findExamById(examId);
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const classId = exam.classSubject.classId;
    const academicYearId = exam.examTerm.academicYearId;

    // Fetch all student enrollments for this class and year
    const enrollments = await this.examsRepository.findStudentEnrollmentsForClass(classId, academicYearId);

    // Fetch existing entered marks
    const enteredMarks = await this.examsRepository.findExamMarksForExam(examId);
    const marksMap = new Map<string, ExamMark>();
    enteredMarks.forEach((m) => marksMap.set(m.studentId, m));

    // Combine enrollments with marks entry
    const roster = enrollments.map((en) => {
      const mark = marksMap.get(en.studentId);
      return {
        studentId: en.studentId,
        rollNumber: en.rollNumber,
        firstName: en.student.firstName,
        middleName: en.student.middleName,
        lastName: en.student.lastName,
        admissionNumber: en.student.admissionNumber,
        marksEntry: mark
          ? {
              status: mark.status,
              theoryObtained: mark.theoryObtained,
              practicalObtained: mark.practicalObtained,
              remarks: mark.remarks,
            }
          : null,
      };
    });

    return {
      exam,
      roster,
    };
  }

  public async submitExamMarks(
    examId: string,
    records: Array<{
      studentId: string;
      status: MarksEntryStatus;
      theoryObtained?: number | null;
      practicalObtained?: number | null;
      remarks?: string | null;
    }>,
    userId: string
  ): Promise<void> {
    const exam = await this.examsRepository.findExamById(examId);
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    // Lock check: if exam term is published, results are frozen
    if (exam.examTerm.status === ExamResultStatus.PUBLISHED) {
      throw new AppError('This exam term results are already published and locked', 403);
    }

    // Validate marks limits for each student row
    for (const rec of records) {
      if (rec.status === MarksEntryStatus.PRESENT) {
        if (rec.theoryObtained === undefined || rec.theoryObtained === null) {
          throw new AppError('Theory marks are required for present students', 400);
        }
        if (rec.theoryObtained > exam.theoryMaxMarks) {
          throw new AppError(
            `Obtained theory mark ${rec.theoryObtained} exceeds max limit of ${exam.theoryMaxMarks}`,
            400
          );
        }

        if (exam.practicalMaxMarks > 0) {
          if (rec.practicalObtained === undefined || rec.practicalObtained === null) {
            throw new AppError('Practical marks are required for present students in this subject', 400);
          }
          if (rec.practicalObtained > exam.practicalMaxMarks) {
            throw new AppError(
              `Obtained practical mark ${rec.practicalObtained} exceeds max limit of ${exam.practicalMaxMarks}`,
              400
            );
          }
        } else {
          // If no practical component, override/ensure practical score is 0 or null
          rec.practicalObtained = null;
        }
      } else {
        // ABSENT or DISQUALIFIED
        rec.theoryObtained = null;
        rec.practicalObtained = null;
      }
    }

    await this.examsRepository.bulkUpsertExamMarks(examId, records, userId);

    await writeAuditLog({
      userId,
      action: 'EXAM_MARKS_ENTERED',
      details: JSON.stringify({ examId, totalStudents: records.length }),
    });
  }

  public async publishExamTerm(termId: string, status: ExamResultStatus, userId: string): Promise<ExamTerm> {
    const term = await this.examsRepository.findExamTermById(termId);
    if (!term) {
      throw new AppError('Exam term not found', 404);
    }

    const updatedTerm = await this.examsRepository.updateExamTerm(termId, { status });

    await writeAuditLog({
      userId,
      action: 'EXAM_TERM_PUBLISHED',
      details: JSON.stringify({ termId, status }),
    });

    if (status === ExamResultStatus.PUBLISHED) {
      // Compile & cache the report cards for all students enrolled in the term's Academic Year classes
      await this.compileReportCardsForTerm(termId);
    }

    return updatedTerm;
  }

  public async getStudentReportCard(termId: string, studentId: string): Promise<any> {
    const reportCard = await this.examsRepository.findExamReportCard(termId, studentId);
    if (!reportCard) {
      throw new AppError('Report card not found or not compiled yet', 404);
    }
    return reportCard;
  }

  public async getTermReportCards(termId: string, classId?: string): Promise<any[]> {
    return this.examsRepository.findTermReportCards(termId, classId);
  }

  private async compileReportCardsForTerm(termId: string): Promise<void> {
    const term = await this.examsRepository.findExamTermById(termId);
    if (!term) return;

    // Fetch all exams scheduled for this term
    const exams = await this.examsRepository.listExams({ examTermId: termId });
    if (exams.length === 0) return;

    // Fetch all grading scale bands
    const scales = await prisma.gradingScale.findMany({
      orderBy: { minPercentage: 'asc' },
    });

    // Fetch all classes that have exams in this term
    const classIds = Array.from(new Set(exams.map((e) => e.classSubject.classId)));

    // Process class-wise student enrollments
    for (const classId of classIds) {
      const enrollments = await this.examsRepository.findStudentEnrollmentsForClass(classId, term.academicYearId);
      const reportCards: any[] = [];

      for (const en of enrollments) {
        let totalMaxPossible = 0;
        let totalObtained = 0;
        let gpSum = 0;
        let subjectCount = 0;
        let overallResultStatus: ResultStatus = ResultStatus.PASS;
        const detailsToInsert: any[] = [];

        for (const exam of exams) {
          if (exam.classSubject.classId !== classId) continue;

          const mark = await prisma.examMark.findUnique({
            where: {
              examId_studentId: { examId: exam.id, studentId: en.studentId },
            },
          });

          const maxSubjectMarks = exam.theoryMaxMarks + exam.practicalMaxMarks;
          totalMaxPossible += maxSubjectMarks;

          let obtainedSubTotal = 0;
          let subStatus: ResultStatus = ResultStatus.FAIL;
          let failedComponent = false;

          if (mark) {
            if (mark.status === MarksEntryStatus.PRESENT) {
              const theory = mark.theoryObtained ?? 0;
              const practical = mark.practicalObtained ?? 0;
              obtainedSubTotal = theory + practical;

              if (theory < exam.theoryPassMarks || (exam.practicalMaxMarks > 0 && practical < exam.practicalPassMarks)) {
                failedComponent = true;
                subStatus = ResultStatus.FAIL;
              } else {
                subStatus = ResultStatus.PASS;
              }
            } else if (mark.status === MarksEntryStatus.ABSENT) {
              subStatus = ResultStatus.ABSENT;
              failedComponent = true;
            } else {
              subStatus = ResultStatus.INCOMPLETE;
              failedComponent = true;
            }
          } else {
            subStatus = ResultStatus.INCOMPLETE;
            failedComponent = true;
          }

          if (subStatus !== ResultStatus.PASS) {
            overallResultStatus = ResultStatus.FAIL;
          }

          totalObtained += obtainedSubTotal;

          // Compute GP for this subject
          const subPercentage = maxSubjectMarks > 0 ? (obtainedSubTotal / maxSubjectMarks) * 100 : 0;
          let subGP = 0;
          let letterGrade = 'NG';

          if (!failedComponent) {
            const match = scales.find((s) => subPercentage >= s.minPercentage && subPercentage <= s.maxPercentage);
            if (match) {
              subGP = match.gpa ?? 0;
              letterGrade = match.grade;
            }
          }

          gpSum += subGP;
          subjectCount++;

          detailsToInsert.push({
            subjectId: exam.classSubject.subjectId,
            theoryObtained: mark?.theoryObtained ?? null,
            practicalObtained: mark?.practicalObtained ?? null,
            totalObtained: obtainedSubTotal,
            percentage: parseFloat(subPercentage.toFixed(2)),
            gradePoint: subGP,
            letterGrade,
            status: subStatus,
            remarks: subStatus === ResultStatus.PASS ? 'Passed' : 'Failed',
          });
        }

        const calculatedGpa = subjectCount > 0 ? parseFloat((gpSum / subjectCount).toFixed(2)) : 0.0;
        const overallPercentage = totalMaxPossible > 0 ? parseFloat(((totalObtained / totalMaxPossible) * 100).toFixed(2)) : 0.0;

        let division = 'Fail';
        if (overallResultStatus === ResultStatus.PASS) {
          if (calculatedGpa >= 3.6) division = 'Distinction';
          else if (calculatedGpa >= 3.0) division = 'First Division';
          else if (calculatedGpa >= 2.0) division = 'Second Division';
          else if (calculatedGpa >= 1.6) division = 'Pass Division';
        }

        const reportCard = await this.examsRepository.upsertExamReportCard({
          examTermId: termId,
          studentId: en.studentId,
          totalMaxMarks: totalMaxPossible,
          totalMarksObtained: totalObtained,
          percentage: overallPercentage,
          gpa: calculatedGpa,
          resultStatus: overallResultStatus,
          division,
          remarks: overallResultStatus === ResultStatus.PASS ? 'Passed Term cycle' : 'Failed one or more courses',
        });

        // Insert subject details
        await this.examsRepository.bulkUpsertReportCardDetails(reportCard.id, detailsToInsert);

        reportCards.push({
          id: reportCard.id,
          studentId: en.studentId,
          sectionId: en.sectionId,
          gpa: calculatedGpa,
          percentage: overallPercentage,
          status: overallResultStatus,
        });
      }

      // Compute Rankings Class-wide
      const sortedClassRC = [...reportCards].sort((a, b) => {
        if (a.status === ResultStatus.PASS && b.status !== ResultStatus.PASS) return -1;
        if (a.status !== ResultStatus.PASS && b.status === ResultStatus.PASS) return 1;
        if (b.gpa !== a.gpa) return b.gpa - a.gpa;
        return b.percentage - a.percentage;
      });

      sortedClassRC.forEach((rc, index) => {
        rc.classRank = index + 1;
      });

      // Compute Rankings Section-wide
      const rankUpdates: any[] = [];
      const sectionIds = Array.from(new Set(reportCards.map((rc) => rc.sectionId)));
      for (const sectId of sectionIds) {
        const sectRC = reportCards.filter((rc) => rc.sectionId === sectId);
        sectRC.sort((a, b) => {
          if (a.status === ResultStatus.PASS && b.status !== ResultStatus.PASS) return -1;
          if (a.status !== ResultStatus.PASS && b.status === ResultStatus.PASS) return 1;
          if (b.gpa !== a.gpa) return b.gpa - a.gpa;
          return b.percentage - a.percentage;
        });
        sectRC.forEach((rc, index) => {
          rc.sectionRank = index + 1;
          rankUpdates.push({
            id: rc.id,
            classRank: rc.classRank,
            sectionRank: index + 1,
          });
        });
      }

      // Save ranks back to DB
      await this.examsRepository.updateReportCardRanks(rankUpdates);
    }

    // Compute Subject Rankings
    const details = await prisma.examReportCardDetail.findMany({
      where: {
        reportCard: { examTermId: termId },
      },
      include: {
        reportCard: {
          include: {
            student: {
              include: {
                enrollments: {
                  where: { academicYearId: term.academicYearId },
                },
              },
            },
          },
        },
      },
    });

    const subjectGroups = new Map<string, any[]>();
    details.forEach((det) => {
      const enrollment = det.reportCard.student.enrollments[0];
      if (!enrollment) return;
      const key = `${enrollment.classId}_${det.subjectId}`;
      if (!subjectGroups.has(key)) {
        subjectGroups.set(key, []);
      }
      subjectGroups.get(key)!.push(det);
    });

    const detailsToUpdate: any[] = [];
    for (const group of subjectGroups.values()) {
      group.sort((a, b) => {
        if (a.status === ResultStatus.PASS && b.status !== ResultStatus.PASS) return -1;
        if (a.status !== ResultStatus.PASS && b.status === ResultStatus.PASS) return 1;
        return b.totalObtained - a.totalObtained;
      });

      group.forEach((det, index) => {
        detailsToUpdate.push(
          prisma.examReportCardDetail.update({
            where: { id: det.id },
            data: {
              subjectRank: index + 1,
            },
          })
        );
      });
    }

    if (detailsToUpdate.length > 0) {
      await prisma.$transaction(detailsToUpdate);
    }
  }
}
