import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { writeAuditLog } from '@/utils/audit-log';
import { DepartmentRepository } from './department.repository';
import { DepartmentService } from './department.service';
import {
  createDepartmentSchema,
  departmentIdParamSchema,
  listDepartmentsQuerySchema,
  updateDepartmentSchema,
} from './department.validator';

const auditContext = (req: Request) => ({
  userId: req.user?.id,
  email: req.user?.email,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

const departmentRepository = new DepartmentRepository();
const departmentService = new DepartmentService(departmentRepository);

export class DepartmentController {
  public createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createDepartmentSchema.parse(req.body);
      const department = await departmentService.createDepartment(validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DEPARTMENT_CREATED',
        entityType: 'department',
        entityId: department.id,
        details: `Created department ${department.id} (${department.name})`,
      });
      return successResponse(res, 'Department created successfully.', { department }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = departmentIdParamSchema.parse(req.params);
      const department = await departmentService.getDepartmentById(id);
      return successResponse(res, 'Department retrieved successfully.', { department });
    } catch (error) {
      next(error);
    }
  };

  public getAllDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { includeArchived } = listDepartmentsQuerySchema.parse(req.query);
      const departments = await departmentService.getAllDepartments(includeArchived);
      return successResponse(res, 'Departments retrieved successfully.', { departments });
    } catch (error) {
      next(error);
    }
  };

  public updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = departmentIdParamSchema.parse(req.params);
      const validated = updateDepartmentSchema.parse(req.body);
      const department = await departmentService.updateDepartment(id, validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DEPARTMENT_UPDATED',
        entityType: 'department',
        entityId: id,
        details: `Updated department ${id}`,
      });
      return successResponse(res, 'Department updated successfully.', { department });
    } catch (error) {
      next(error);
    }
  };

  public archiveDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = departmentIdParamSchema.parse(req.params);
      const department = await departmentService.archiveDepartment(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DEPARTMENT_ARCHIVED',
        entityType: 'department',
        entityId: id,
        details: `Archived department ${id} (${department.name})`,
      });
      return successResponse(res, 'Department archived successfully.', { department });
    } catch (error) {
      next(error);
    }
  };

  public deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = departmentIdParamSchema.parse(req.params);
      const department = await departmentService.deleteDepartment(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'DEPARTMENT_DELETED',
        entityType: 'department',
        entityId: id,
        details: `Deleted department ${id} (${department.name})`,
      });
      return successResponse(res, 'Department deleted successfully.', { department });
    } catch (error) {
      next(error);
    }
  };
}
