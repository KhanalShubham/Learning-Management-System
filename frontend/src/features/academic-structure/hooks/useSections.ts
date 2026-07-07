import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academicStructureService } from '../services/academic-structure.service';
import type { CreateSectionPayload, UpdateSectionPayload } from '../types';

const sectionsQueryKey = (classId?: string) => ['sections', classId ?? null];

export const useSections = (classId?: string, includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...sectionsQueryKey(classId), includeArchived ?? false],
    queryFn: () => academicStructureService.listSections(classId, includeArchived),
    enabled: !!classId,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSectionPayload) => academicStructureService.createSection(payload),
    onSuccess: (section) =>
      queryClient.invalidateQueries({ queryKey: sectionsQueryKey(section.classId) }),
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSectionPayload }) =>
      academicStructureService.updateSection(id, payload),
    onSuccess: (section) =>
      queryClient.invalidateQueries({ queryKey: sectionsQueryKey(section.classId) }),
  });
};

export const useArchiveSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.archiveSection(id),
    onSuccess: (section) =>
      queryClient.invalidateQueries({ queryKey: sectionsQueryKey(section.classId) }),
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.deleteSection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] }),
  });
};
