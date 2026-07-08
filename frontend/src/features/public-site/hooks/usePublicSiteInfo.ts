import { useQuery } from '@tanstack/react-query';
import { publicSiteService } from '../services/public-site.service';

export const usePublicSiteInfo = () => {
  return useQuery({
    queryKey: ['public-site', 'site-info'],
    queryFn: publicSiteService.getSiteInfo,
    staleTime: 5 * 60 * 1000,
  });
};
