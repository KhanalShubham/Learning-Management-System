import { SchoolSettings, Prisma } from '@prisma/client';
import { ISettingsRepository } from './settings.repository';

export class SettingsService {
  constructor(private settingsRepository: ISettingsRepository) {}

  public async getSettings(): Promise<SchoolSettings> {
    return this.settingsRepository.getOrCreate();
  }

  public async updateSettings(data: Prisma.SchoolSettingsUpdateInput): Promise<SchoolSettings> {
    const settings = await this.settingsRepository.getOrCreate();
    return this.settingsRepository.update(settings.id, data);
  }
}
