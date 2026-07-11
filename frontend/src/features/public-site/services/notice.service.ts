import { api } from '@/services/api';
import type { PublicNotice } from '../types';

export const noticeService = {
  async listPublished(skip = 0, take = 50): Promise<{ data: PublicNotice[]; total: number }> {
    const response = await api.get('/notices', { params: { skip, take } });
    return response.data.data;
  },

  async getBySlug(slug: string): Promise<PublicNotice> {
    const response = await api.get(`/notices/${slug}`);
    return response.data.data.notice;
  },
};

export default noticeService;
