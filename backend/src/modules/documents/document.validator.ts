import { z } from 'zod';

// Schema for defining a template variable structure
const variableDefinitionSchema = z.object({
  name: z.string().min(1, 'Variable name is required'),
  label: z.string().min(1, 'Variable label is required'),
  type: z.enum(['text', 'number', 'date', 'image']),
  required: z.boolean().default(true),
  defaultValue: z.string().optional().default(''),
});

// Schema for creating a document template
export const createTemplateSchema = z.object({
  name: z.string().min(3, 'Template name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.enum(['ACADEMIC', 'EXAMINATION', 'IDENTITY', 'FINANCE', 'EMPLOYMENT']),
  type: z.string().min(2, 'Type is required'),
  description: z.string().optional(),
  htmlTemplate: z.string().min(10, 'HTML template is too short'),
  cssTemplate: z.string().default(''),
  pageSize: z.enum(['A4', 'LETTER', 'LEGAL', 'CUSTOM']).default('A4'),
  orientation: z.enum(['PORTRAIT', 'LANDSCAPE']).default('PORTRAIT'),
  isDefault: z.boolean().default(false),
  variables: z.array(variableDefinitionSchema).default([]),
});

// Schema for updating an existing template
export const updateTemplateSchema = z.object({
  name: z.string().min(3, 'Template name must be at least 3 characters').optional(),
  description: z.string().optional(),
  htmlTemplate: z.string().min(10, 'HTML template is too short').optional(),
  cssTemplate: z.string().optional(),
  pageSize: z.enum(['A4', 'LETTER', 'LEGAL', 'CUSTOM']).optional(),
  orientation: z.enum(['PORTRAIT', 'LANDSCAPE']).optional(),
  isDefault: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  variables: z.array(variableDefinitionSchema).optional(),
  changeReason: z.string().optional().default('Administrative update'),
});

// Schema for live template preview renderer
export const previewTemplateSchema = z.object({
  htmlTemplate: z.string().min(1, 'HTML template is required'),
  cssTemplate: z.string().default(''),
  variables: z.record(z.any()).default({}),
  studentId: z.string().uuid('Invalid student ID').optional(),
  teacherId: z.string().uuid('Invalid teacher ID').optional(),
});

// Schema for generating a new document instance
export const generateDocumentSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
  studentId: z.string().uuid('Invalid student ID').optional(),
  teacherId: z.string().uuid('Invalid teacher ID').optional(),
  variables: z.record(z.any()).default({}),
});

// Schema for restoring template to historic version
export const restoreTemplateSchema = z.object({
  version: z.number().int().positive('Version must be a positive integer'),
});
