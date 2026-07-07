import { SchoolProfile, Prisma } from '@prisma/client';
import { ISchoolProfileRepository } from './school-profile.repository';

export class SchoolProfileService {
  constructor(private schoolProfileRepository: ISchoolProfileRepository) {}

  public async getProfile(): Promise<SchoolProfile> {
    return this.schoolProfileRepository.getOrCreate();
  }

  public async updateProfile(data: Prisma.SchoolProfileUpdateInput): Promise<SchoolProfile> {
    const profile = await this.schoolProfileRepository.getOrCreate();
    return this.schoolProfileRepository.update(profile.id, data);
  }
}
