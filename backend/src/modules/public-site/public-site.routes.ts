import { Router } from 'express';
import { PublicSiteController } from './public-site.controller';
import { DocumentController } from '@/modules/documents/document.controller';

// No requireAuth here — this router backs the public marketing site and must
// be reachable by anonymous visitors.
const router = Router();
const publicSiteController = new PublicSiteController();
const documentController = new DocumentController();

router.get('/site-info', publicSiteController.getSiteInfo);
router.get('/verify/:id', documentController.verifyDocument);

export default router;
