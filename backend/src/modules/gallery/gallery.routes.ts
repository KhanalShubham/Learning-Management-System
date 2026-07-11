/**
 * Gallery CMS — public reads (no auth), admin-authored writes.
 * Reuses cms.edit / cms.publish, same as the Notice CMS.
 */
import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { upload } from '@/middleware/upload.middleware';
import { GalleryController } from './gallery.controller';

const router = Router();
const galleryController = new GalleryController();

const canEdit = requirePermission('cms.edit');
const canPublish = requirePermission('cms.publish');

// Public
router.get('/', galleryController.getPublishedImages);

// Admin
router.post('/image-upload', requireAuth, canEdit, upload.single('file'), galleryController.uploadImage);
router.post('/admin', requireAuth, canEdit, galleryController.addImage);
router.get('/admin/all', requireAuth, canEdit, galleryController.getAllImages);
router.put('/admin/:id', requireAuth, canEdit, galleryController.updateImage);
router.post('/admin/:id/archive', requireAuth, canPublish, galleryController.archiveImage);
router.delete('/admin/:id', requireAuth, canPublish, galleryController.deleteImage);

export default router;
