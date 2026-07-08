import { api } from '@/services/api';
import type { PublicSiteInfo } from '../types';

export const publicSiteService = {
  async getSiteInfo(): Promise<PublicSiteInfo> {
    const response = await api.get('/public/site-info');
    return response.data.data.info;
  },
};

export default publicSiteService;
