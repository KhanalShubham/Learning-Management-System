import { prisma } from '@/prisma/client';
import { Notice, Prisma, RecordStatus } from '@prisma/client';

export interface ListNoticesFilters {
  includeArchived?: boolean;
  skip?: number;
  take?: number;
}

export interface INoticeRepository {
  create(data: Prisma.NoticeCreateInput): Promise<Notice>;
  findById(id: string): Promise<Notice | null>;
  findBySlug(slug: string): Promise<Notice | null>;
  slugExists(slug: string): Promise<boolean>;
  findAll(filters: ListNoticesFilters): Promise<{ data: Notice[]; total: number }>;
  findPublished(skip: number, take: number): Promise<{ data: Notice[]; total: number }>;
  update(id: string, data: Prisma.NoticeUpdateInput): Promise<Notice>;
  archive(id: string): Promise<Notice>;
  delete(id: string): Promise<Notice>;
}

// Pinned notices always sort first, then most-recently-published — same
// ordering for both the admin list and the public-facing feed.
const defaultOrderBy: Prisma.NoticeOrderByWithRelationInput[] = [
  { isPinned: 'desc' },
  { publishedAt: 'desc' },
];

export class NoticeRepository implements INoticeRepository {
  public async create(data: Prisma.NoticeCreateInput): Promise<Notice> {
    return prisma.notice.create({ data });
  }

  public async findById(id: string): Promise<Notice | null> {
    return prisma.notice.findUnique({ where: { id } });
  }

  public async findBySlug(slug: string): Promise<Notice | null> {
    return prisma.notice.findUnique({ where: { slug } });
  }

  public async slugExists(slug: string): Promise<boolean> {
    const existing = await prisma.notice.findUnique({ where: { slug }, select: { id: true } });
    return !!existing;
  }

  public async findAll(filters: ListNoticesFilters): Promise<{ data: Notice[]; total: number }> {
    const { includeArchived, skip = 0, take = 20 } = filters;
    const where: Prisma.NoticeWhereInput = includeArchived ? {} : { status: RecordStatus.ACTIVE };

    const [data, total] = await Promise.all([
      prisma.notice.findMany({ where, skip, take, orderBy: defaultOrderBy }),
      prisma.notice.count({ where }),
    ]);

    return { data, total };
  }

  public async findPublished(skip: number, take: number): Promise<{ data: Notice[]; total: number }> {
    const where: Prisma.NoticeWhereInput = { status: RecordStatus.ACTIVE, publishedAt: { lte: new Date() } };
    const [data, total] = await Promise.all([
      prisma.notice.findMany({ where, skip, take, orderBy: defaultOrderBy }),
      prisma.notice.count({ where }),
    ]);
    return { data, total };
  }

  public async update(id: string, data: Prisma.NoticeUpdateInput): Promise<Notice> {
    return prisma.notice.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<Notice> {
    return prisma.notice.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<Notice> {
    return prisma.notice.delete({ where: { id } });
  }
}
