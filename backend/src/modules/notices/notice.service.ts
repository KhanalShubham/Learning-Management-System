import { Notice, Prisma } from '@prisma/client';
import { AppError } from '@/middleware/error.middleware';
import { INoticeRepository, ListNoticesFilters } from './notice.repository';

const slugify = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

export interface CreateNoticeData {
  title: string;
  tag: Notice['tag'];
  excerpt: string;
  body: string[];
  attachmentUrl?: string;
  isPinned?: boolean;
  publishedAt?: Date;
}

export type UpdateNoticeData = Partial<CreateNoticeData>;

export class NoticeService {
  constructor(private noticeRepository: INoticeRepository) {}

  // Slugs are derived from the title, not typed by hand — collisions get a
  // numeric suffix, same reasoning as any other auto-generated identifier
  // in this codebase (employeeId, admissionNumber).
  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'notice';
    let slug = base;
    let suffix = 1;
    while (await this.noticeRepository.slugExists(slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }

  public async createNotice(data: CreateNoticeData): Promise<Notice> {
    const slug = await this.generateUniqueSlug(data.title);
    return this.noticeRepository.create({ ...data, slug });
  }

  public async getNoticeById(id: string): Promise<Notice> {
    const notice = await this.noticeRepository.findById(id);
    if (!notice) {
      throw new AppError('Notice not found', 404);
    }
    return notice;
  }

  public async getPublishedNoticeBySlug(slug: string): Promise<Notice> {
    const notice = await this.noticeRepository.findBySlug(slug);
    if (!notice || notice.status !== 'ACTIVE') {
      throw new AppError('Notice not found', 404);
    }
    return notice;
  }

  public async getAllNotices(filters: ListNoticesFilters) {
    return this.noticeRepository.findAll(filters);
  }

  public async getPublishedNotices(skip: number, take: number) {
    return this.noticeRepository.findPublished(skip, take);
  }

  public async updateNotice(id: string, data: UpdateNoticeData): Promise<Notice> {
    await this.getNoticeById(id);
    const payload: Prisma.NoticeUpdateInput = { ...data };
    // Re-slugging on every title edit would break already-shared links —
    // the slug is fixed at creation, same as an admission/employee number.
    return this.noticeRepository.update(id, payload);
  }

  public async archiveNotice(id: string): Promise<Notice> {
    await this.getNoticeById(id);
    return this.noticeRepository.archive(id);
  }

  public async deleteNotice(id: string): Promise<Notice> {
    await this.getNoticeById(id);
    return this.noticeRepository.delete(id);
  }
}
