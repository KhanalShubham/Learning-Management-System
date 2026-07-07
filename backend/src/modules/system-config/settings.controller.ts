import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';
import { updateSettingsSchema } from './settings.validator';

const settingsRepository = new SettingsRepository();
const settingsService = new SettingsService(settingsRepository);

export class SettingsController {
  public getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await settingsService.getSettings();
      return successResponse(res, 'Settings retrieved successfully.', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateSettingsSchema.parse(req.body);
      const settings = await settingsService.updateSettings(validated);
      return successResponse(res, 'Settings updated successfully.', { settings });
    } catch (error) {
      next(error);
    }
  };
}
