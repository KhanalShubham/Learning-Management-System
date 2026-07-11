import { api } from '@/services/api';
import type { PublicGalleryImage } from '../types';

export const galleryService = {
  async listPublished(): Promise<PublicGalleryImage[]> {
    const response = await api.get('/gallery');
    return response.data.data.images;
  },
};

export default galleryService;
