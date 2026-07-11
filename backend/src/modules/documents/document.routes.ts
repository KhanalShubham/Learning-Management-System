import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { DocumentController } from './document.controller';

const router = Router();

const canView = requirePermission('certificates.view');
const canGenerate = requirePermission('certificates.generate');
const canDownload = requirePermission('certificates.download');

const controller = new DocumentController();

// All operational routes require authentication
router.use(requireAuth);

// Templates
router.get('/templates', canView, controller.getTemplates);
router.get('/templates/:id', canView, controller.getTemplateById);
router.post('/templates', canGenerate, controller.createTemplate);
router.put('/templates/:id', canGenerate, controller.updateTemplate);
router.post('/templates/:id/duplicate', canGenerate, controller.duplicateTemplate);
router.post('/templates/:id/restore', canGenerate, controller.restoreTemplateVersion);

// Live Preview
router.post('/templates/preview', canView, controller.previewTemplate);

// Document Generation Instances
router.post('/generate', canGenerate, controller.generateDocument);
router.get('/history', canView, controller.getGeneratedDocuments);
router.get('/:id', canView, controller.getGeneratedDocumentById);
router.post('/:id/log-action', canDownload, controller.logAction);

export default router;
