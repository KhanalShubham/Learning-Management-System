import { api } from '@/services/api';
import type {
  Notice,
  CreateNoticePayload,
  UpdateNoticePayload,
  GalleryImage,
  AddGalleryImagePayload,
  UpdateGalleryImagePayload,
} from '../types';

export const cmsService = {
  // Notices
  async listNotices(includeArchived?: boolean): Promise<{ data: Notice[]; total: number }> {
    const response = await api.get('/notices/admin/all', { params: { includeArchived, take: 100 } });
    return response.data.data;
  },

  async createNotice(payload: CreateNoticePayload): Promise<Notice> {
    const response = await api.post('/notices/admin', payload);
    return response.data.data.notice;
  },

  async updateNotice(id: string, payload: UpdateNoticePayload): Promise<Notice> {
    const response = await api.put(`/notices/admin/${id}`, payload);
    return response.data.data.notice;
  },

  async archiveNotice(id: string): Promise<Notice> {
    const response = await api.post(`/notices/admin/${id}/archive`);
    return response.data.data.notice;
  },

  async deleteNotice(id: string): Promise<void> {
    await api.delete(`/notices/admin/${id}`);
  },

  async uploadNoticeAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/notices/attachment-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.fileUrl;
  },

  // Gallery
  async listGalleryImages(includeArchived?: boolean): Promise<GalleryImage[]> {
    const response = await api.get('/gallery/admin/all', { params: { includeArchived } });
    return response.data.data.images;
  },

  async uploadGalleryImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/gallery/image-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.imageUrl;
  },

  async addGalleryImage(payload: AddGalleryImagePayload): Promise<GalleryImage> {
    const response = await api.post('/gallery/admin', payload);
    return response.data.data.image;
  },

  async updateGalleryImage(id: string, payload: UpdateGalleryImagePayload): Promise<GalleryImage> {
    const response = await api.put(`/gallery/admin/${id}`, payload);
    return response.data.data.image;
  },

  async archiveGalleryImage(id: string): Promise<GalleryImage> {
    const response = await api.post(`/gallery/admin/${id}/archive`);
    return response.data.data.image;
  },

  async deleteGalleryImage(id: string): Promise<void> {
    await api.delete(`/gallery/admin/${id}`);
  },
};

export default cmsService;
