import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '../services/cms.service';
import type { CreateNoticePayload, UpdateNoticePayload } from '../types';

const NOTICES_QUERY_KEY = ['cms-notices'];

export const useNotices = (includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...NOTICES_QUERY_KEY, includeArchived ?? false],
    queryFn: () => cmsService.listNotices(includeArchived),
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNoticePayload) => cmsService.createNotice(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTICES_QUERY_KEY }),
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNoticePayload }) => cmsService.updateNotice(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTICES_QUERY_KEY }),
  });
};

export const useArchiveNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.archiveNotice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTICES_QUERY_KEY }),
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.deleteNotice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTICES_QUERY_KEY }),
  });
};

export const useUploadNoticeAttachment = () => {
  return useMutation({
    mutationFn: (file: File) => cmsService.uploadNoticeAttachment(file),
  });
};
