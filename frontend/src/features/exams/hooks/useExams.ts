import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examsService } from '../services/exams.service';
import type { ExamResultStatus, MarksEntryStatus } from '../types';

export const useExamTerms = (academicYearId?: string) => {
  return useQuery({
    queryKey: ['exams', 'terms', academicYearId],
    queryFn: () => examsService.getExamTerms(academicYearId),
  });
};

export const useCreateExamTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: examsService.createExamTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'terms'] });
    },
  });
};

export const usePublishExamTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { termId: string; status: ExamResultStatus }) =>
      examsService.publishExamTerm(variables.termId, variables.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['exams', 'schedules'] });
    },
  });
};

export const useExamsSchedule = (filters: {
  examTermId?: string;
  classSubjectId?: string;
  classId?: string;
}) => {
  return useQuery({
    queryKey: ['exams', 'schedules', filters],
    queryFn: () => examsService.getExams(filters),
    enabled: !!filters.examTermId || !!filters.classId,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: examsService.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'schedules'] });
    },
  });
};

export const useExamRoster = (examId: string) => {
  return useQuery({
    queryKey: ['exams', 'roster', examId],
    queryFn: () => examsService.getExamRoster(examId),
    enabled: !!examId,
  });
};

export const useSubmitExamMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      examId: string;
      records: Array<{
        studentId: string;
        status: MarksEntryStatus;
        theoryObtained?: number | null;
        practicalObtained?: number | null;
        remarks?: string | null;
      }>;
    }) => examsService.submitExamMarks(variables.examId, variables.records),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'roster', variables.examId] });
    },
  });
};

export const useStudentReportCard = (termId: string, studentId: string) => {
  return useQuery({
    queryKey: ['exams', 'report-card', termId, studentId],
    queryFn: () => examsService.getStudentReportCard(termId, studentId),
    enabled: !!termId && !!studentId,
  });
};

export const useTermReportCards = (termId: string, classId?: string) => {
  return useQuery({
    queryKey: ['exams', 'report-cards', termId, classId],
    queryFn: () => examsService.getTermReportCards(termId, classId),
    enabled: !!termId,
  });
};
