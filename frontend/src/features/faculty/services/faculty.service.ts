import { api } from '@/services/api';
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  Designation,
  CreateDesignationPayload,
  UpdateDesignationPayload,
  Teacher,
  TeacherDetail,
  RegisterTeacherPayload,
  UpdateTeacherPayload,
  ListTeachersFilters,
  ListTeachersResult,
  TeacherSummary,
  TeacherStatus,
  QualificationInput,
  TeacherQualification,
  EmergencyContactInput,
  TeacherEmergencyContact,
  DocumentInput,
  TeacherDocument,
  TeacherLeaveBalance,
  LeaveBalanceAdjustment,
} from '../types';

/**
 * Faculty Management Engine Service
 *
 * Handles client-side API contract calls to the backend's /faculty/*
 * department, designation, and teacher registration/records endpoints.
 */
export const facultyService = {
  // Departments
  async listDepartments(includeArchived?: boolean): Promise<Department[]> {
    const response = await api.get('/faculty/departments', { params: { includeArchived } });
    return response.data.data.departments;
  },

  async createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
    const response = await api.post('/faculty/departments', payload);
    return response.data.data.department;
  },

  async updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<Department> {
    const response = await api.put(`/faculty/departments/${id}`, payload);
    return response.data.data.department;
  },

  async archiveDepartment(id: string): Promise<Department> {
    const response = await api.post(`/faculty/departments/${id}/archive`);
    return response.data.data.department;
  },

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/faculty/departments/${id}`);
  },

  // Designations
  async listDesignations(includeArchived?: boolean): Promise<Designation[]> {
    const response = await api.get('/faculty/designations', { params: { includeArchived } });
    return response.data.data.designations;
  },

  async createDesignation(payload: CreateDesignationPayload): Promise<Designation> {
    const response = await api.post('/faculty/designations', payload);
    return response.data.data.designation;
  },

  async updateDesignation(id: string, payload: UpdateDesignationPayload): Promise<Designation> {
    const response = await api.put(`/faculty/designations/${id}`, payload);
    return response.data.data.designation;
  },

  async archiveDesignation(id: string): Promise<Designation> {
    const response = await api.post(`/faculty/designations/${id}/archive`);
    return response.data.data.designation;
  },

  async deleteDesignation(id: string): Promise<void> {
    await api.delete(`/faculty/designations/${id}`);
  },

  // File uploads (plumbing only)
  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/faculty/teachers/photo-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.photoUrl;
  },

  async uploadDocumentFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/faculty/teachers/document-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.fileUrl;
  },

  // Teachers
  async registerTeacher(payload: RegisterTeacherPayload): Promise<TeacherDetail> {
    const response = await api.post('/faculty/teachers', payload);
    return response.data.data.teacher;
  },

  async listTeachers(filters: ListTeachersFilters): Promise<ListTeachersResult> {
    const response = await api.get('/faculty/teachers', { params: filters });
    return response.data.data;
  },

  async getSummary(): Promise<TeacherSummary> {
    const response = await api.get('/faculty/teachers/summary');
    return response.data.data.summary;
  },

  async getTeacher(id: string): Promise<TeacherDetail> {
    const response = await api.get(`/faculty/teachers/${id}`);
    return response.data.data.teacher;
  },

  async updateTeacher(id: string, payload: UpdateTeacherPayload): Promise<Teacher> {
    const response = await api.put(`/faculty/teachers/${id}`, payload);
    return response.data.data.teacher;
  },

  async updateTeacherStatus(id: string, status: TeacherStatus, leavingDate?: string): Promise<Teacher> {
    const response = await api.post(`/faculty/teachers/${id}/status`, { status, leavingDate });
    return response.data.data.teacher;
  },

  async deleteTeacher(id: string): Promise<void> {
    await api.delete(`/faculty/teachers/${id}`);
  },

  // Qualifications
  async addQualification(teacherId: string, payload: QualificationInput): Promise<TeacherQualification> {
    const response = await api.post(`/faculty/teachers/${teacherId}/qualifications`, payload);
    return response.data.data.qualification;
  },

  async deleteQualification(teacherId: string, qualificationId: string): Promise<void> {
    await api.delete(`/faculty/teachers/${teacherId}/qualifications/${qualificationId}`);
  },

  // Emergency contacts
  async addEmergencyContact(teacherId: string, payload: EmergencyContactInput): Promise<TeacherEmergencyContact> {
    const response = await api.post(`/faculty/teachers/${teacherId}/emergency-contacts`, payload);
    return response.data.data.contact;
  },

  async updateEmergencyContact(
    teacherId: string,
    contactId: string,
    payload: Partial<EmergencyContactInput>
  ): Promise<TeacherEmergencyContact> {
    const response = await api.put(`/faculty/teachers/${teacherId}/emergency-contacts/${contactId}`, payload);
    return response.data.data.contact;
  },

  async deleteEmergencyContact(teacherId: string, contactId: string): Promise<void> {
    await api.delete(`/faculty/teachers/${teacherId}/emergency-contacts/${contactId}`);
  },

  // Documents
  async addDocument(teacherId: string, payload: DocumentInput): Promise<TeacherDocument> {
    const response = await api.post(`/faculty/teachers/${teacherId}/documents`, payload);
    return response.data.data.document;
  },

  async deleteDocument(teacherId: string, documentId: string): Promise<void> {
    await api.delete(`/faculty/teachers/${teacherId}/documents/${documentId}`);
  },

  // Leave balance
  async getLeaveBalance(teacherId: string): Promise<TeacherLeaveBalance> {
    const response = await api.get(`/faculty/teachers/${teacherId}/leave-balance`);
    return response.data.data.leaveBalance;
  },

  async adjustLeaveBalance(teacherId: string, payload: LeaveBalanceAdjustment): Promise<TeacherLeaveBalance> {
    const response = await api.patch(`/faculty/teachers/${teacherId}/leave-balance`, payload);
    return response.data.data.leaveBalance;
  },
};

export default facultyService;
