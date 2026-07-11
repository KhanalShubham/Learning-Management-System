import { api } from '@/services/api';
import type {
  ExamTerm,
  Exam,
  ExamReportCard,
  ExamRosterResult,
  MarksEntryStatus,
  ExamResultStatus,
} from '../types';

export const examsService = {
  // Exam Terms
  async getExamTerms(academicYearId?: string): Promise<ExamTerm[]> {
    const response = await api.get('/exams/terms', {
      params: { academicYearId },
    });
    return response.data.data;
  },

  async createExamTerm(payload: {
    name: string;
    academicYearId: string;
    startDate: string;
    endDate: string;
  }): Promise<ExamTerm> {
    const response = await api.post('/exams/terms', payload);
    return response.data.data;
  },

  async publishExamTerm(termId: string, status: ExamResultStatus): Promise<ExamTerm> {
    const response = await api.post(`/exams/terms/${termId}/publish`, { status });
    return response.data.data;
  },

  // Exam Schedules
  async getExams(filters: {
    examTermId?: string;
    classSubjectId?: string;
    classId?: string;
  }): Promise<Exam[]> {
    const response = await api.get('/exams', {
      params: filters,
    });
    return response.data.data;
  },

  async createExam(payload: {
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
  }): Promise<Exam> {
    const response = await api.post('/exams', payload);
    return response.data.data;
  },

  // Ledger Roster & Marks Entries
  async getExamRoster(examId: string): Promise<ExamRosterResult> {
    const response = await api.get(`/exams/${examId}/ledger`);
    return response.data.data;
  },

  async submitExamMarks(
    examId: string,
    records: Array<{
      studentId: string;
      status: MarksEntryStatus;
      theoryObtained?: number | null;
      practicalObtained?: number | null;
      remarks?: string | null;
    }>
  ): Promise<void> {
    await api.post(`/exams/${examId}/ledger`, { records });
  },

  // Report Cards
  async getStudentReportCard(termId: string, studentId: string): Promise<ExamReportCard> {
    const response = await api.get(`/exams/terms/${termId}/report-cards/${studentId}`);
    return response.data.data;
  },

  async getTermReportCards(termId: string, classId?: string): Promise<ExamReportCard[]> {
    const response = await api.get(`/exams/terms/${termId}/report-cards`, {
      params: { classId },
    });
    return response.data.data;
  },
};
