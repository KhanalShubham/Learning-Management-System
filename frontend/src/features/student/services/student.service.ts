import { api } from '@/services/api';
import type {
  Student,
  StudentDetail,
  Guardian,
  GuardianInput,
  StudentDocument,
  DocumentInput,
  AdmitStudentPayload,
  UpdateStudentPayload,
  ListStudentsFilters,
  ListStudentsResult,
  StudentStatus,
} from '../types';

/**
 * Student Admission Engine Service
 *
 * Handles client-side API contract calls to the backend's /students/*
 * admission workflow, student record, guardian, and document endpoints.
 */
export const studentService = {
  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/students/photo-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.photoUrl;
  },

  async uploadDocumentFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/students/document-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.fileUrl;
  },

  async admitStudent(payload: AdmitStudentPayload): Promise<StudentDetail> {
    const response = await api.post('/students/admission', payload);
    return response.data.data.student;
  },

  async listStudents(filters: ListStudentsFilters): Promise<ListStudentsResult> {
    const response = await api.get('/students', { params: filters });
    return response.data.data;
  },

  async getStudent(id: string): Promise<StudentDetail> {
    const response = await api.get(`/students/${id}`);
    return response.data.data.student;
  },

  async updateStudent(id: string, payload: UpdateStudentPayload): Promise<Student> {
    const response = await api.put(`/students/${id}`, payload);
    return response.data.data.student;
  },

  async updateStudentStatus(id: string, status: StudentStatus): Promise<Student> {
    const response = await api.post(`/students/${id}/status`, { status });
    return response.data.data.student;
  },

  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },

  async addGuardian(studentId: string, payload: GuardianInput): Promise<Guardian> {
    const response = await api.post(`/students/${studentId}/guardians`, payload);
    return response.data.data.guardian;
  },

  async updateGuardian(
    studentId: string,
    guardianId: string,
    payload: Partial<Omit<GuardianInput, 'relation'>>
  ): Promise<Guardian> {
    const response = await api.put(`/students/${studentId}/guardians/${guardianId}`, payload);
    return response.data.data.guardian;
  },

  async deleteGuardian(studentId: string, guardianId: string): Promise<void> {
    await api.delete(`/students/${studentId}/guardians/${guardianId}`);
  },

  async addDocument(studentId: string, payload: DocumentInput): Promise<StudentDocument> {
    const response = await api.post(`/students/${studentId}/documents`, payload);
    return response.data.data.document;
  },

  async deleteDocument(studentId: string, documentId: string): Promise<void> {
    await api.delete(`/students/${studentId}/documents/${documentId}`);
  },
};

export default studentService;
