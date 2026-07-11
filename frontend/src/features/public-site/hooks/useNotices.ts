import { useQuery } from '@tanstack/react-query';
import { noticeService } from '../services/notice.service';

export const usePublicNotices = () => {
  return useQuery({
    queryKey: ['public-notices'],
    queryFn: () => noticeService.listPublished(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicNotice = (slug: string) => {
  return useQuery({
    queryKey: ['public-notice', slug],
    queryFn: () => noticeService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};
