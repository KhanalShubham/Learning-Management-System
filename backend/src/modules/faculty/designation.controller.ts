import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { writeAuditLog } from '@/utils/audit-log';
import { DesignationRepository } from './designation.repository';
import { DesignationService } from './designation.service';
import {
  createDesignationSchema,
  designationIdParamSchema,
  listDesignationsQuerySchema,
  updateDesignationSchema,
} from './designation.validator';

const auditContext = (req: Request) => ({
  userId: req.user?.id,
  email: req.user?.email,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

const designationRepository = new DesignationRepository();
const designationService = new DesignationService(designationRepository);

export class DesignationController {
  public createDesignation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createDesignationSchema.parse(req.body);
      const designation = await designationService.createDesignation(validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DESIGNATION_CREATED',
        entityType: 'designation',
        entityId: designation.id,
        details: `Created designation ${designation.id} (${designation.name})`,
      });
      return successResponse(res, 'Designation created successfully.', { designation }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getDesignationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = designationIdParamSchema.parse(req.params);
      const designation = await designationService.getDesignationById(id);
      return successResponse(res, 'Designation retrieved successfully.', { designation });
    } catch (error) {
      next(error);
    }
  };

  public getAllDesignations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { includeArchived } = listDesignationsQuerySchema.parse(req.query);
      const designations = await designationService.getAllDesignations(includeArchived);
      return successResponse(res, 'Designations retrieved successfully.', { designations });
    } catch (error) {
      next(error);
    }
  };

  public updateDesignation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = designationIdParamSchema.parse(req.params);
      const validated = updateDesignationSchema.parse(req.body);
      const designation = await designationService.updateDesignation(id, validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DESIGNATION_UPDATED',
        entityType: 'designation',
        entityId: id,
        details: `Updated designation ${id}`,
      });
      return successResponse(res, 'Designation updated successfully.', { designation });
    } catch (error) {
      next(error);
    }
  };

  public archiveDesignation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = designationIdParamSchema.parse(req.params);
      const designation = await designationService.archiveDesignation(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DESIGNATION_ARCHIVED',
        entityType: 'designation',
        entityId: id,
        details: `Archived designation ${id} (${designation.name})`,
      });
      return successResponse(res, 'Designation archived successfully.', { designation });
    } catch (error) {
      next(error);
    }
  };

  public deleteDesignation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = designationIdParamSchema.parse(req.params);
      const designation = await designationService.deleteDesignation(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DESIGNATION_DELETED',
        entityType: 'designation',
        entityId: id,
        details: `Deleted designation ${id} (${designation.name})`,
      });
      return successResponse(res, 'Designation deleted successfully.', { designation });
    } catch (error) {
      next(error);
    }
  };
}
