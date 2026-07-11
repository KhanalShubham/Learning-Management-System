import { useQuery } from '@tanstack/react-query';
import { galleryService } from '../services/gallery.service';

export const usePublicGallery = () => {
  return useQuery({
    queryKey: ['public-gallery'],
    queryFn: galleryService.listPublished,
    staleTime: 5 * 60 * 1000,
  });
};
