import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/faculty.service';
import type { CreateDepartmentPayload, UpdateDepartmentPayload } from '../types';

const DEPARTMENTS_QUERY_KEY = ['faculty-departments'];

export const useDepartments = (includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...DEPARTMENTS_QUERY_KEY, includeArchived ?? false],
    queryFn: () => facultyService.listDepartments(includeArchived),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => facultyService.createDepartment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentPayload }) =>
      facultyService.updateDepartment(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
};

export const useArchiveDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.archiveDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.deleteDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
};
