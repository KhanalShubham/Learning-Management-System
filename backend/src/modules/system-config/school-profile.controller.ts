import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { SchoolProfileRepository } from './school-profile.repository';
import { SchoolProfileService } from './school-profile.service';
import { updateSchoolProfileSchema } from './school-profile.validator';

const schoolProfileRepository = new SchoolProfileRepository();
const schoolProfileService = new SchoolProfileService(schoolProfileRepository);

export class SchoolProfileController {
  public getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await schoolProfileService.getProfile();
      return successResponse(res, 'School profile retrieved successfully.', { profile });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateSchoolProfileSchema.parse(req.body);
      const profile = await schoolProfileService.updateProfile(validated);
      return successResponse(res, 'School profile updated successfully.', { profile });
    } catch (error) {
      next(error);
    }
  };
}
