import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { writeAuditLog } from '@/utils/audit-log';
import { AppError } from '@/middleware/error.middleware';
import { uploadDocumentBuffer } from '@/config/cloudinary';
import { NoticeRepository } from './notice.repository';
import { NoticeService } from './notice.service';
import {
  createNoticeSchema,
  noticeIdParamSchema,
  noticeSlugParamSchema,
  listNoticesQuerySchema,
  listPublishedNoticesQuerySchema,
  updateNoticeSchema,
} from './notice.validator';

const auditContext = (req: Request) => ({
  userId: req.user?.id,
  email: req.user?.email,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

const noticeRepository = new NoticeRepository();
const noticeService = new NoticeService(noticeRepository);

export class NoticeController {
  // Public — no auth. Only ACTIVE notices whose publishedAt has passed.
  public getPublishedNotices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skip, take } = listPublishedNoticesQuerySchema.parse(req.query);
      const result = await noticeService.getPublishedNotices(skip, take);
      return successResponse(res, 'Notices retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getPublishedNoticeBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = noticeSlugParamSchema.parse(req.params);
      const notice = await noticeService.getPublishedNoticeBySlug(slug);
      return successResponse(res, 'Notice retrieved successfully.', { notice });
    } catch (error) {
      next(error);
    }
  };

  // Admin — requires cms.edit / cms.publish (see notice.routes.ts).
  public createNotice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createNoticeSchema.parse(req.body);
      const notice = await noticeService.createNotice(validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'NOTICE_CREATED',
        entityType: 'notice',
        entityId: notice.id,
        details: `Created notice ${notice.id} (${notice.slug})`,
      });
      return successResponse(res, 'Notice created successfully.', { notice }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getAllNotices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = listNoticesQuerySchema.parse(req.query);
      const result = await noticeService.getAllNotices(filters);
      return successResponse(res, 'Notices retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getNoticeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = noticeIdParamSchema.parse(req.params);
      const notice = await noticeService.getNoticeById(id);
      return successResponse(res, 'Notice retrieved successfully.', { notice });
    } catch (error) {
      next(error);
    }
  };

  public updateNotice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = noticeIdParamSchema.parse(req.params);
      const validated = updateNoticeSchema.parse(req.body);
      const notice = await noticeService.updateNotice(id, validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'NOTICE_UPDATED',
        entityType: 'notice',
        entityId: id,
        details: `Updated notice ${id}`,
      });
      return successResponse(res, 'Notice updated successfully.', { notice });
    } catch (error) {
      next(error);
    }
  };

  public archiveNotice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = noticeIdParamSchema.parse(req.params);
      const notice = await noticeService.archiveNotice(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'NOTICE_ARCHIVED',
        details: `Archived notice ${id} (${notice.slug})`,
      });
      return successResponse(res, 'Notice archived successfully.', { notice });
    } catch (error) {
      next(error);
    }
  };

  public deleteNotice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = noticeIdParamSchema.parse(req.params);
      const notice = await noticeService.deleteNotice(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'NOTICE_DELETED',
        details: `Deleted notice ${id} (${notice.slug})`,
      });
      return successResponse(res, 'Notice deleted successfully.', { notice });
    } catch (error) {
      next(error);
    }
  };

  // Generic upload plumbing (no DB write) — same pattern as teachers/students.
  public uploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }
      const fileUrl = await uploadDocumentBuffer(req.file.buffer, 'notices/attachments');
      return successResponse(res, 'File uploaded successfully.', { fileUrl });
    } catch (error) {
      next(error);
    }
  };
}
