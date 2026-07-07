import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolService } from '../services/school.service';
import type { CreateAcademicYearPayload, UpdateAcademicYearPayload } from '../types';

const ACADEMIC_YEARS_QUERY_KEY = ['academic-years'];

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ACADEMIC_YEARS_QUERY_KEY,
    queryFn: schoolService.listAcademicYears,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAcademicYearPayload) => schoolService.createAcademicYear(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY }),
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAcademicYearPayload }) =>
      schoolService.updateAcademicYear(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY }),
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolService.deleteAcademicYear(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY }),
  });
};

export const useSetCurrentAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolService.setCurrentAcademicYear(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY }),
  });
};
