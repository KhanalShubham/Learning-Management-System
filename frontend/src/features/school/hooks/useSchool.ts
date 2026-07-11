import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolService } from '../services/school.service';
import type {
  UpdateSchoolProfilePayload,
  UpdateBrandingPayload,
  UpdateLeadershipPayload,
  UpdateSettingsPayload,
  LeadershipRole,
} from '../types';

const PROFILE_QUERY_KEY = ['school', 'profile'];
const BRANDING_QUERY_KEY = ['school', 'branding'];
const LEADERSHIP_QUERY_KEY = ['school', 'leadership'];
const SETTINGS_QUERY_KEY = ['school', 'settings'];

export const useSchoolProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: schoolService.getProfile,
  });
};

export const useUpdateSchoolProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSchoolProfilePayload) => schoolService.updateProfile(payload),
    onSuccess: (profile) => queryClient.setQueryData(PROFILE_QUERY_KEY, profile),
  });
};

export const useBranding = () => {
  return useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: schoolService.getBranding,
  });
};

export const useUpdateBranding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBrandingPayload) => schoolService.updateBranding(payload),
    onSuccess: (branding) => queryClient.setQueryData(BRANDING_QUERY_KEY, branding),
  });
};

export const useUploadBrandingImage = (
  field: 'logo' | 'favicon' | 'stamp' | 'signature' | 'reportHeader' | 'reportFooter' | 'cover'
) => {
  const queryClient = useQueryClient();
  const uploader = {
    logo: schoolService.uploadLogo,
    favicon: schoolService.uploadFavicon,
    stamp: schoolService.uploadStamp,
    signature: schoolService.uploadSignature,
    reportHeader: schoolService.uploadReportHeader,
    reportFooter: schoolService.uploadReportFooter,
    cover: schoolService.uploadCoverImage,
  }[field];

  return useMutation({
    mutationFn: (file: File) => uploader(file),
    onSuccess: (branding) => queryClient.setQueryData(BRANDING_QUERY_KEY, branding),
  });
};

export const useLeadership = () => {
  return useQuery({
    queryKey: LEADERSHIP_QUERY_KEY,
    queryFn: schoolService.getLeadership,
  });
};

export const useUpdateLeadership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, payload }: { role: LeadershipRole; payload: UpdateLeadershipPayload }) =>
      schoolService.updateLeadership(role, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADERSHIP_QUERY_KEY }),
  });
};

export const useUploadLeadershipImage = (field: 'photo' | 'signature') => {
  const queryClient = useQueryClient();
  const uploader = {
    photo: schoolService.uploadLeadershipPhoto,
    signature: schoolService.uploadLeadershipSignature,
  }[field];

  return useMutation({
    mutationFn: ({ role, file }: { role: LeadershipRole; file: File }) => uploader(role, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADERSHIP_QUERY_KEY }),
  });
};

export const useSchoolSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: schoolService.getSettings,
  });
};

export const useUpdateSchoolSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => schoolService.updateSettings(payload),
    onSuccess: (settings) => queryClient.setQueryData(SETTINGS_QUERY_KEY, settings),
  });
};
