import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '../services/cms.service';
import type { AddGalleryImagePayload, UpdateGalleryImagePayload } from '../types';

const GALLERY_QUERY_KEY = ['cms-gallery'];

export const useGalleryImages = (includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...GALLERY_QUERY_KEY, includeArchived ?? false],
    queryFn: () => cmsService.listGalleryImages(includeArchived),
  });
};

export const useUploadGalleryImageFile = () => {
  return useMutation({
    mutationFn: (file: File) => cmsService.uploadGalleryImageFile(file),
  });
};

export const useAddGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddGalleryImagePayload) => cmsService.addGalleryImage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
};

export const useUpdateGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGalleryImagePayload }) =>
      cmsService.updateGalleryImage(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
};

export const useArchiveGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.archiveGalleryImage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
};

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.deleteGalleryImage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
};
