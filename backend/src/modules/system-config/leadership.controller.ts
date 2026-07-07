import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { uploadImageBuffer } from '@/config/cloudinary';
import { LeadershipRepository } from './leadership.repository';
import { LeadershipService } from './leadership.service';
import { leadershipRoleParamSchema, updateLeadershipSchema } from './leadership.validator';

const leadershipRepository = new LeadershipRepository();
const leadershipService = new LeadershipService(leadershipRepository);

export class LeadershipController {
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leadership = await leadershipService.getAll();
      return successResponse(res, 'Leadership directory retrieved successfully.', { leadership });
    } catch (error) {
      next(error);
    }
  };

  public updateByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = leadershipRoleParamSchema.parse(req.params);
      const validated = updateLeadershipSchema.parse(req.body);
      const entry = await leadershipService.updateByRole(role, validated);
      return successResponse(res, 'Leadership entry updated successfully.', { entry });
    } catch (error) {
      next(error);
    }
  };

  private handleImageUpload = (field: 'photoUrl' | 'signatureUrl', folder: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { role } = leadershipRoleParamSchema.parse(req.params);
        if (!req.file) {
          throw new AppError('No image file was provided', 400);
        }
        const url = await uploadImageBuffer(req.file.buffer, `${folder}/${role.toLowerCase()}`);
        const entry = await leadershipService.updateImage(role, field, url);
        return successResponse(res, 'Image uploaded successfully.', { entry });
      } catch (error) {
        next(error);
      }
    };
  };

  public uploadPhoto = this.handleImageUpload('photoUrl', 'leadership/photo');
  public uploadSignature = this.handleImageUpload('signatureUrl', 'leadership/signature');
}
