import { prisma } from '@/prisma/client';
import { AppError } from '@/middleware/error.middleware';
import { Holiday, AttendanceLock } from '@prisma/client';

export class AttendanceConfigService {
  public async createHoliday(data: { name: string; startDate: string; endDate: string }): Promise<Holiday> {
    const start = new Date(`${data.startDate}T00:00:00Z`);
    const end = new Date(`${data.endDate}T00:00:00Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Invalid date format', 400);
    }
    if (start > end) {
      throw new AppError('Start date cannot be after end date', 400);
    }

    // Check for overlap
    const overlap = await prisma.holiday.findFirst({
      where: {
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });
    if (overlap) {
      throw new AppError(`Holiday dates overlap with an existing holiday: ${overlap.name}`, 409);
    }

    return prisma.holiday.create({
      data: {
        name: data.name,
        startDate: start,
        endDate: end,
      },
    });
  }

  public async getHolidays(): Promise<Holiday[]> {
    return prisma.holiday.findMany({
      orderBy: { startDate: 'asc' },
    });
  }

  public async deleteHoliday(id: string): Promise<Holiday> {
    const holiday = await prisma.holiday.findUnique({ where: { id } });
    if (!holiday) {
      throw new AppError('Holiday not found', 404);
    }
    return prisma.holiday.delete({ where: { id } });
  }

  public async toggleLock(
    userId: string,
    data: { date: string; sectionId?: string | null; isLocked: boolean }
  ): Promise<AttendanceLock> {
    const date = new Date(`${data.date}T00:00:00Z`);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    return prisma.attendanceLock.upsert({
      where: {
        date_sectionId: {
          date,
          sectionId: data.sectionId ?? 'GLOBAL',
        },
      },
      update: {
        isLocked: data.isLocked,
        lockedById: userId,
      },
      create: {
        date,
        sectionId: data.sectionId ?? 'GLOBAL',
        isLocked: data.isLocked,
        lockedById: userId,
      },
    });
  }

  public async checkLockState(date: Date, sectionId: string | null): Promise<boolean> {
    const lock = await prisma.attendanceLock.findUnique({
      where: {
        date_sectionId: {
          date,
          sectionId: sectionId ?? 'GLOBAL',
        },
      },
    });
    return lock ? lock.isLocked : false;
  }

  public async isHolidayOrWeekend(date: Date): Promise<{ isBlocked: boolean; reason?: string }> {
    // 1. Weekend Check (Saturday is Day 6 in UTC getUTCDay())
    const dayOfWeek = date.getUTCDay();
    if (dayOfWeek === 6) {
      return { isBlocked: true, reason: 'Saturdays are standard weekends.' };
    }

    // 2. Custom Holidays Check
    const holiday = await prisma.holiday.findFirst({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
    if (holiday) {
      return { isBlocked: true, reason: `Holiday: ${holiday.name}` };
    }

    return { isBlocked: false };
  }
}
