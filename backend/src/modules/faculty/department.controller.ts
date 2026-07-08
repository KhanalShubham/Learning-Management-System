import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { DepartmentRepository } from './department.repository';
import { DepartmentService } from './department.service';
import {
  createDepartmentSchema,
  departmentIdParamSchema,
  listDepartmentsQuerySchema,
  updateDepartmentSchema,
} from './department.validator';

const departmentRepository = new DepartmentRepository();
const departmentService = new DepartmentService(departmentRepository);

export class DepartmentController {
  public createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createDepartmentSchema.parse(req.body);
      const department = await departmentService.createDepartment(validated);
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
      return successResponse(res, 'Department updated successfully.', { department });
    } catch (error) {
      next(error);
    }
  };

  public archiveDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = departmentIdParamSchema.parse(req.params);
      const department = await departmentService.archiveDepartment(id);
      return successResponse(res, 'Department archived successfully.', { department });
    } catch (error) {
      next(error);
    }
  };

  public deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = departmentIdParamSchema.parse(req.params);
      const department = await departmentService.deleteDepartment(id);
      return successResponse(res, 'Department deleted successfully.', { department });
    } catch (error) {
      next(error);
    }
  };
}
