import { api } from '@/services/api';
import type {
  DocumentTemplate,
  GeneratedDocument,
  VerificationResult,
} from '../types';

export const documentService = {
  // --- Template Management ---

  async listTemplates(): Promise<DocumentTemplate[]> {
    const response = await api.get('/documents/templates');
    return response.data.data.templates;
  },

  async getTemplate(id: string): Promise<DocumentTemplate> {
    const response = await api.get(`/documents/templates/${id}`);
    return response.data.data.template;
  },

  async createTemplate(payload: any): Promise<DocumentTemplate> {
    const response = await api.post('/documents/templates', payload);
    return response.data.data.template;
  },

  async updateTemplate(id: string, payload: any): Promise<DocumentTemplate> {
    const response = await api.put(`/documents/templates/${id}`, payload);
    return response.data.data.template;
  },

  async duplicateTemplate(id: string, name: string, slug: string): Promise<DocumentTemplate> {
    const response = await api.post(`/documents/templates/${id}/duplicate`, { name, slug });
    return response.data.data.template;
  },

  async restoreTemplateVersion(id: string, version: number): Promise<DocumentTemplate> {
    const response = await api.post(`/documents/templates/${id}/restore`, { version });
    return response.data.data.template;
  },

  // --- Preview Renderer ---

  async getPreviewHtml(htmlTemplate: string, cssTemplate: string, variables: Record<string, any>): Promise<string> {
    const response = await api.post('/documents/templates/preview', {
      htmlTemplate,
      cssTemplate,
      variables,
    }, {
      responseType: 'text',
      headers: {
        'Accept': 'text/html',
      }
    });
    return response.data;
  },

  // --- Generation & Verification ---

  async generateDocument(payload: {
    templateId: string;
    studentId?: string;
    teacherId?: string;
    variables?: Record<string, any>;
  }): Promise<GeneratedDocument> {
    const response = await api.post('/documents/generate', payload);
    return response.data.data.document;
  },

  async listGeneratedDocuments(filters?: {
    studentId?: string;
    teacherId?: string;
    templateId?: string;
  }): Promise<GeneratedDocument[]> {
    const response = await api.get('/documents/history', { params: filters });
    return response.data.data.documents;
  },

  async getGeneratedDocument(id: string): Promise<GeneratedDocument> {
    const response = await api.get(`/documents/${id}`);
    return response.data.data.document;
  },

  async logDocumentAction(id: string, action: 'PRINT' | 'DOWNLOAD'): Promise<void> {
    await api.post(`/documents/${id}/log-action`, { action });
  },

  async verifyDocumentPublic(id: string): Promise<VerificationResult> {
    const response = await api.get(`/public/verify/${id}`);
    return response.data.data.verificationResult;
  },
};

export default documentService;
