import { api } from '@/services/api';
import type {
  SchoolProfile,
  UpdateSchoolProfilePayload,
  SchoolBranding,
  UpdateBrandingPayload,
  LeadershipEntry,
  LeadershipRole,
  UpdateLeadershipPayload,
  SchoolSettings,
  UpdateSettingsPayload,
  AcademicYear,
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
} from '../types';

const uploadBrandingImage = async (endpoint: string, file: File): Promise<SchoolBranding> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.branding;
};

const uploadLeadershipImage = async (
  role: LeadershipRole,
  field: 'photo' | 'signature',
  file: File
): Promise<LeadershipEntry> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/system/leadership/${role}/${field}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.entry;
};

/**
 * School Configuration Service
 *
 * Handles client-side API contract calls to the backend's /system/* school
 * profile, branding, leadership, settings, and academic year endpoints.
 */
export const schoolService = {
  async getProfile(): Promise<SchoolProfile> {
    const response = await api.get('/system/school');
    return response.data.data.profile;
  },

  async updateProfile(payload: UpdateSchoolProfilePayload): Promise<SchoolProfile> {
    const response = await api.put('/system/school', payload);
    return response.data.data.profile;
  },

  async getBranding(): Promise<SchoolBranding> {
    const response = await api.get('/system/branding');
    return response.data.data.branding;
  },

  async updateBranding(payload: UpdateBrandingPayload): Promise<SchoolBranding> {
    const response = await api.put('/system/branding', payload);
    return response.data.data.branding;
  },

  async uploadLogo(file: File): Promise<SchoolBranding> {
    return uploadBrandingImage('/system/branding/logo', file);
  },

  async uploadFavicon(file: File): Promise<SchoolBranding> {
    return uploadBrandingImage('/system/branding/favicon', file);
  },

  async uploadStamp(file: File): Promise<SchoolBranding> {
    return uploadBrandingImage('/system/branding/stamp', file);
  },

  async uploadSignature(file: File): Promise<SchoolBranding> {
    return uploadBrandingImage('/system/branding/signature', file);
  },

  async uploadReportHeader(file: File): Promise<SchoolBranding> {
    return uploadBrandingImage('/system/branding/report-header', file);
  },

  async uploadReportFooter(file: File): Promise<SchoolBranding> {
    return uploadBrandingImage('/system/branding/report-footer', file);
  },

  async getLeadership(): Promise<LeadershipEntry[]> {
    const response = await api.get('/system/leadership');
    return response.data.data.leadership;
  },

  async updateLeadership(
    role: LeadershipRole,
    payload: UpdateLeadershipPayload
  ): Promise<LeadershipEntry> {
    const response = await api.put(`/system/leadership/${role}`, payload);
    return response.data.data.entry;
  },

  async uploadLeadershipPhoto(role: LeadershipRole, file: File): Promise<LeadershipEntry> {
    return uploadLeadershipImage(role, 'photo', file);
  },

  async uploadLeadershipSignature(role: LeadershipRole, file: File): Promise<LeadershipEntry> {
    return uploadLeadershipImage(role, 'signature', file);
  },

  async getSettings(): Promise<SchoolSettings> {
    const response = await api.get('/system/settings');
    return response.data.data.settings;
  },

  async updateSettings(payload: UpdateSettingsPayload): Promise<SchoolSettings> {
    const response = await api.put('/system/settings', payload);
    return response.data.data.settings;
  },

  async listAcademicYears(): Promise<AcademicYear[]> {
    const response = await api.get('/system/academic-years');
    return response.data.data.years;
  },

  async createAcademicYear(payload: CreateAcademicYearPayload): Promise<AcademicYear> {
    const response = await api.post('/system/academic-years', payload);
    return response.data.data.year;
  },

  async updateAcademicYear(
    id: string,
    payload: UpdateAcademicYearPayload
  ): Promise<AcademicYear> {
    const response = await api.put(`/system/academic-years/${id}`, payload);
    return response.data.data.year;
  },

  async deleteAcademicYear(id: string): Promise<void> {
    await api.delete(`/system/academic-years/${id}`);
  },

  async setCurrentAcademicYear(id: string): Promise<AcademicYear> {
    const response = await api.post(`/system/academic-years/${id}/activate`);
    return response.data.data.year;
  },
};

export default schoolService;
