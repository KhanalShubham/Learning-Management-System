export interface SchoolProfile {
  id: string;
  name: string;
  shortName: string | null;
  motto: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  municipality: string | null;
  ward: string | null;
  postalCode: string | null;
  googleMapLink: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSchoolProfilePayload = Partial<
  Omit<SchoolProfile, 'id' | 'createdAt' | 'updatedAt'>
>;

export interface SchoolBranding {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  stampUrl: string | null;
  principalSignatureUrl: string | null;
  reportHeaderImageUrl: string | null;
  reportFooterImageUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateBrandingPayload = Partial<
  Pick<SchoolBranding, 'primaryColor' | 'secondaryColor'>
>;

export type LeadershipRole = 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'ADMINISTRATOR' | 'ACCOUNT_OFFICER';

export interface LeadershipEntry {
  id: string;
  role: LeadershipRole;
  name: string;
  designation: string | null;
  photoUrl: string | null;
  signatureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLeadershipPayload {
  name?: string;
  designation?: string;
}

export type AttendanceMethod = 'ADMIN_ONLY' | 'TEACHER' | 'BIOMETRIC';

export interface SchoolSettings {
  id: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: number;
  defaultPassword: string;
  attendanceMethod: AttendanceMethod;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingsPayload = Partial<
  Omit<SchoolSettings, 'id' | 'createdAt' | 'updatedAt'>
>;

export type AcademicYearStatus = 'ACTIVE' | 'ARCHIVED';

export interface AcademicYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: AcademicYearStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicYearPayload {
  label: string;
  startDate: string;
  endDate: string;
}

export type UpdateAcademicYearPayload = Partial<CreateAcademicYearPayload> & {
  status?: AcademicYearStatus;
};
