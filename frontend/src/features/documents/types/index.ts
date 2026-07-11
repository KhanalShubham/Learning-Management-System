export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'image';
  required: boolean;
  defaultValue?: string;
}

export interface DocumentTemplateHistory {
  id: string;
  templateId: string;
  version: number;
  changeReason?: string;
  createdAt: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  slug: string;
  category: 'ACADEMIC' | 'EXAMINATION' | 'IDENTITY' | 'FINANCE' | 'EMPLOYMENT';
  type: string;
  description?: string;
  htmlTemplate: string;
  cssTemplate: string;
  pageSize: 'A4' | 'LETTER' | 'LEGAL' | 'CUSTOM';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  isDefault: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  variables: TemplateVariable[];
  version: number;
  createdAt: string;
  updatedAt: string;
  histories?: DocumentTemplateHistory[];
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  studentId?: string;
  teacherId?: string;
  generatedBy: string;
  documentNumber: string;
  htmlSnapshot: string;
  pdfPath?: string;
  variablesUsed: Record<string, any>;
  status: 'ISSUED' | 'REVOKED' | 'DRAFT';
  version: number;
  generatedAt: string;
  updatedAt: string;
  template?: {
    name: string;
    category: string;
    type: string;
    pageSize?: 'A4' | 'LETTER' | 'LEGAL' | 'CUSTOM';
    orientation?: 'PORTRAIT' | 'LANDSCAPE';
  };
  student?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    admissionNumber: string;
  };
  teacher?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    employeeId: string;
  };
}

export interface VerificationResult {
  id: string;
  documentNumber: string;
  status: 'ISSUED' | 'REVOKED' | 'DRAFT' | 'INVALID';
  generatedAt?: string;
  templateName?: string;
  category?: string;
  recipientName?: string;
  message?: string; // Present when status is INVALID
}
