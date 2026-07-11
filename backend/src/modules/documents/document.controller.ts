import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { DocumentService } from './document.service';
import {
  createTemplateSchema,
  updateTemplateSchema,
  previewTemplateSchema,
  generateDocumentSchema,
  restoreTemplateSchema,
} from './document.validator';
import { AuditAction } from '@prisma/client';
import { writeAuditLog } from '@/utils/audit-log';

const documentService = new DocumentService();

export class DocumentController {
  
  // --- Template Management ---

  public getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await documentService.getTemplates();
      return successResponse(res, 'Templates retrieved successfully.', { templates });
    } catch (error) {
      next(error);
    }
  };

  public getTemplateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const template = await documentService.getTemplateById(id);
      return successResponse(res, 'Template retrieved successfully.', { template });
    } catch (error) {
      next(error);
    }
  };

  public createTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id || 'system';
      const validated = createTemplateSchema.parse(req.body);
      const template = await documentService.createTemplate(validated, userId);
      return successResponse(res, 'Template created successfully.', { template }, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';
      const validated = updateTemplateSchema.parse(req.body);
      const template = await documentService.updateTemplate(id, validated, userId);
      return successResponse(res, 'Template updated successfully.', { template });
    } catch (error) {
      next(error);
    }
  };

  public duplicateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';
      const { name, slug } = req.body;
      if (!name || !slug) {
        throw new AppError('New template name and slug are required for duplicating', 400);
      }
      const template = await documentService.duplicateTemplate(id, name, slug, userId);
      return successResponse(res, 'Template duplicated successfully.', { template }, 201);
    } catch (error) {
      next(error);
    }
  };

  public restoreTemplateVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';
      const validated = restoreTemplateSchema.parse(req.body);
      const template = await documentService.restoreTemplateVersion(id, validated.version, userId);
      return successResponse(res, 'Template version restored successfully.', { template });
    } catch (error) {
      next(error);
    }
  };

  // --- Preview Engine ---

  public previewTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = previewTemplateSchema.parse(req.body);
      const compiledHTML = await documentService.previewTemplate(
        validated.htmlTemplate,
        validated.cssTemplate,
        validated.variables
      );
      
      // Return raw compiled HTML content to render directly inside iframe
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(compiledHTML);
    } catch (error) {
      next(error);
    }
  };

  // --- Generation & Verification ---

  public generateDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id || 'system';
      const validated = generateDocumentSchema.parse(req.body);
      const document = await documentService.generateDocument(
        validated.templateId,
        validated.studentId,
        validated.teacherId,
        validated.variables,
        userId
      );
      return successResponse(res, 'Document generated and issued successfully.', { document }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getGeneratedDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, teacherId, templateId } = req.query;
      const documents = await documentService.getGeneratedDocuments({
        studentId: studentId as string,
        teacherId: teacherId as string,
        templateId: templateId as string,
      });
      return successResponse(res, 'Generated documents list retrieved successfully.', { documents });
    } catch (error) {
      next(error);
    }
  };

  public getGeneratedDocumentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await documentService.getGeneratedDocumentById(id);
      return successResponse(res, 'Generated document details retrieved successfully.', { document });
    } catch (error) {
      next(error);
    }
  };

  public verifyDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const verificationResult = await documentService.verifyDocument(id);
      return successResponse(res, 'Document verification processed successfully.', { verificationResult });
    } catch (error) {
      // Return false success structure instead of crashing, for clean public verification checks
      if (error instanceof AppError && error.statusCode === 404) {
        return res.status(200).json({
          success: true,
          message: 'Document verification failed. Record not found.',
          data: {
            verificationResult: {
              status: 'INVALID',
              message: 'This document does not match any valid record in our ERP database.',
            }
          },
          errors: null
        });
      }
      next(error);
    }
  };

  public logAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const userId = (req as any).user?.id || 'system';

      if (!action || !['PRINT', 'DOWNLOAD'].includes(action)) {
        throw new AppError('Invalid print/download audit action requested', 400);
      }

      const auditAction = action === 'PRINT' ? AuditAction.DOCUMENT_PRINTED : AuditAction.DOCUMENT_DOWNLOADED;
      await writeAuditLog({
        userId,
        action: auditAction,
        entityType: 'generated_document',
        entityId: id,
        details: `Document was ${action.toLowerCase()}ed.`,
      });

      return successResponse(res, `Logged document ${action.toLowerCase()} audit.`, null);
    } catch (error) {
      next(error);
    }
  };
}
export default DocumentController;
