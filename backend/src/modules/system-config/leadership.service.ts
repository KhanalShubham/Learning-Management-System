import { Leadership, LeadershipRole, Prisma } from '@prisma/client';
import { ILeadershipRepository } from './leadership.repository';

export class LeadershipService {
  constructor(private leadershipRepository: ILeadershipRepository) {}

  public async getAll(): Promise<Leadership[]> {
    return this.leadershipRepository.getAll();
  }

  public async updateByRole(
    role: LeadershipRole,
    data: Prisma.LeadershipUpdateInput
  ): Promise<Leadership> {
    return this.leadershipRepository.upsertByRole(role, data);
  }

  public async updateImage(
    role: LeadershipRole,
    field: 'photoUrl' | 'signatureUrl',
    url: string
  ): Promise<Leadership> {
    return this.leadershipRepository.updateImage(role, field, url);
  }
}
