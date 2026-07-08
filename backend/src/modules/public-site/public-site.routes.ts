import { Router } from 'express';
import { PublicSiteController } from './public-site.controller';

// No requireAuth here — this router backs the public marketing site and must
// be reachable by anonymous visitors.
const router = Router();
const publicSiteController = new PublicSiteController();

router.get('/site-info', publicSiteController.getSiteInfo);

export default router;
