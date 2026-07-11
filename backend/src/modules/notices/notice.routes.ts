/**
 * Notice CMS — public reads (no auth), admin-authored writes.
 *
 * Reuses the existing cms.edit / cms.publish permissions rather than
 * introducing notices.* codes — this engine is deliberately kept small.
 */
import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { uploadDocument } from '@/middleware/upload.middleware';
import { NoticeController } from './notice.controller';

const router = Router();
const noticeController = new NoticeController();

const canEdit = requirePermission('cms.edit');
const canPublish = requirePermission('cms.publish');

// Public
router.get('/', noticeController.getPublishedNotices);
router.get('/:slug', noticeController.getPublishedNoticeBySlug);

// Admin
router.post('/attachment-upload', requireAuth, canEdit, uploadDocument.single('file'), noticeController.uploadAttachment);
router.post('/admin', requireAuth, canEdit, noticeController.createNotice);
router.get('/admin/all', requireAuth, canEdit, noticeController.getAllNotices);
router.get('/admin/:id', requireAuth, canEdit, noticeController.getNoticeById);
router.put('/admin/:id', requireAuth, canEdit, noticeController.updateNotice);
router.post('/admin/:id/archive', requireAuth, canPublish, noticeController.archiveNotice);
router.delete('/admin/:id', requireAuth, canPublish, noticeController.deleteNotice);

export default router;
