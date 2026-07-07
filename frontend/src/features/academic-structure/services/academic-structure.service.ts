import { api } from '@/services/api';
import type {
  Class,
  CreateClassPayload,
  UpdateClassPayload,
  Section,
  CreateSectionPayload,
  UpdateSectionPayload,
  Subject,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  ClassSubject,
  CreateClassSubjectPayload,
  UpdateClassSubjectPayload,
  ExamType,
  CreateExamTypePayload,
  UpdateExamTypePayload,
  AcademicStructureTree,
} from '../types';

/**
 * Academic Structure Engine Service
 *
 * Handles client-side API contract calls to the backend's /academic-structure/* class,
 * section, subject, and class-subject reference-data endpoints.
 */
export const academicStructureService = {
  async listClasses(academicYearId?: string, includeArchived?: boolean): Promise<Class[]> {
    const response = await api.get('/academic-structure/classes', {
      params: { academicYearId, includeArchived },
    });
    return response.data.data.classes;
  },

  async createClass(payload: CreateClassPayload): Promise<Class> {
    const response = await api.post('/academic-structure/classes', payload);
    return response.data.data.class;
  },

  async updateClass(id: string, payload: UpdateClassPayload): Promise<Class> {
    const response = await api.put(`/academic-structure/classes/${id}`, payload);
    return response.data.data.class;
  },

  async archiveClass(id: string): Promise<Class> {
    const response = await api.post(`/academic-structure/classes/${id}/archive`);
    return response.data.data.class;
  },

  async deleteClass(id: string): Promise<void> {
    await api.delete(`/academic-structure/classes/${id}`);
  },

  async listSections(classId?: string, includeArchived?: boolean): Promise<Section[]> {
    const response = await api.get('/academic-structure/sections', { params: { classId, includeArchived } });
    return response.data.data.sections;
  },

  async createSection(payload: CreateSectionPayload): Promise<Section> {
    const response = await api.post('/academic-structure/sections', payload);
    return response.data.data.section;
  },

  async updateSection(id: string, payload: UpdateSectionPayload): Promise<Section> {
    const response = await api.put(`/academic-structure/sections/${id}`, payload);
    return response.data.data.section;
  },

  async archiveSection(id: string): Promise<Section> {
    const response = await api.post(`/academic-structure/sections/${id}/archive`);
    return response.data.data.section;
  },

  async deleteSection(id: string): Promise<void> {
    await api.delete(`/academic-structure/sections/${id}`);
  },

  async listSubjects(includeArchived?: boolean): Promise<Subject[]> {
    const response = await api.get('/academic-structure/subjects', { params: { includeArchived } });
    return response.data.data.subjects;
  },

  async createSubject(payload: CreateSubjectPayload): Promise<Subject> {
    const response = await api.post('/academic-structure/subjects', payload);
    return response.data.data.subject;
  },

  async updateSubject(id: string, payload: UpdateSubjectPayload): Promise<Subject> {
    const response = await api.put(`/academic-structure/subjects/${id}`, payload);
    return response.data.data.subject;
  },

  async archiveSubject(id: string): Promise<Subject> {
    const response = await api.post(`/academic-structure/subjects/${id}/archive`);
    return response.data.data.subject;
  },

  async deleteSubject(id: string): Promise<void> {
    await api.delete(`/academic-structure/subjects/${id}`);
  },

  async listClassSubjects(classId?: string): Promise<ClassSubject[]> {
    const response = await api.get('/academic-structure/class-subjects', { params: { classId } });
    return response.data.data.classSubjects;
  },

  async createClassSubject(payload: CreateClassSubjectPayload): Promise<ClassSubject> {
    const response = await api.post('/academic-structure/class-subjects', payload);
    return response.data.data.classSubject;
  },

  async updateClassSubject(
    id: string,
    payload: UpdateClassSubjectPayload
  ): Promise<ClassSubject> {
    const response = await api.put(`/academic-structure/class-subjects/${id}`, payload);
    return response.data.data.classSubject;
  },

  async deleteClassSubject(id: string): Promise<void> {
    await api.delete(`/academic-structure/class-subjects/${id}`);
  },

  async listExamTypes(academicYearId?: string, includeArchived?: boolean): Promise<ExamType[]> {
    const response = await api.get('/academic-structure/exam-types', {
      params: { academicYearId, includeArchived },
    });
    return response.data.data.examTypes;
  },

  async createExamType(payload: CreateExamTypePayload): Promise<ExamType> {
    const response = await api.post('/academic-structure/exam-types', payload);
    return response.data.data.examType;
  },

  async updateExamType(id: string, payload: UpdateExamTypePayload): Promise<ExamType> {
    const response = await api.put(`/academic-structure/exam-types/${id}`, payload);
    return response.data.data.examType;
  },

  async archiveExamType(id: string): Promise<ExamType> {
    const response = await api.post(`/academic-structure/exam-types/${id}/archive`);
    return response.data.data.examType;
  },

  async deleteExamType(id: string): Promise<void> {
    await api.delete(`/academic-structure/exam-types/${id}`);
  },

  async getStructureTree(academicYearId?: string): Promise<AcademicStructureTree> {
    const response = await api.get('/academic-structure/structure', { params: { academicYearId } });
    return response.data.data;
  },
};

export default academicStructureService;
