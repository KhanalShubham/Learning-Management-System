import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/faculty.service';
import type { CreateDesignationPayload, UpdateDesignationPayload } from '../types';

const DESIGNATIONS_QUERY_KEY = ['faculty-designations'];

export const useDesignations = (includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...DESIGNATIONS_QUERY_KEY, includeArchived ?? false],
    queryFn: () => facultyService.listDesignations(includeArchived),
  });
};

export const useCreateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDesignationPayload) => facultyService.createDesignation(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGNATIONS_QUERY_KEY }),
  });
};

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDesignationPayload }) =>
      facultyService.updateDesignation(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGNATIONS_QUERY_KEY }),
  });
};

export const useArchiveDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.archiveDesignation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGNATIONS_QUERY_KEY }),
  });
};

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.deleteDesignation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGNATIONS_QUERY_KEY }),
  });
};
