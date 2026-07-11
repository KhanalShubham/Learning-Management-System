import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { AttendanceConfigService } from './attendance-config.service';
import { createHolidaySchema, toggleLockSchema } from './attendance.validator';

const configService = new AttendanceConfigService();

export class AttendanceConfigController {
  public createHoliday = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createHolidaySchema.parse(req.body);
      const holiday = await configService.createHoliday(validated);
      return successResponse(res, 'Holiday created successfully.', { holiday }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getHolidays = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const holidays = await configService.getHolidays();
      return successResponse(res, 'Holidays retrieved successfully.', { holidays });
    } catch (error) {
      next(error);
    }
  };

  public deleteHoliday = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Holiday ID parameter is required', 400);
      }
      const holiday = await configService.deleteHoliday(id);
      return successResponse(res, 'Holiday deleted successfully.', { holiday });
    } catch (error) {
      next(error);
    }
  };

  public toggleLock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = toggleLockSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication credentials missing', 401);
      }
      const lock = await configService.toggleLock(userId, validated);
      return successResponse(
        res,
        `Attendance session ${lock.isLocked ? 'locked' : 'unlocked'} successfully.`,
        { lock }
      );
    } catch (error) {
      next(error);
    }
  };
}
