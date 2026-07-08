import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { PublicSiteService } from './public-site.service';

const publicSiteService = new PublicSiteService();

export class PublicSiteController {
  public getSiteInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const info = await publicSiteService.getSiteInfo();
      return successResponse(res, 'Public site info retrieved successfully.', { info });
    } catch (error) {
      next(error);
    }
  };
}
