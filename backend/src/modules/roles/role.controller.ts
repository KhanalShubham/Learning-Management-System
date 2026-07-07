import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { createRoleSchema, updateRoleSchema, roleIdParamSchema } from './role.validator';

const roleRepository = new RoleRepository();
const roleService = new RoleService(roleRepository);

export class RoleController {
  public createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createRoleSchema.parse(req.body);
      const role = await roleService.createRole(validated);
      return successResponse(res, 'Role created successfully.', { role }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getRoleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = roleIdParamSchema.parse(req.params);
      const role = await roleService.getRoleById(id);
      return successResponse(res, 'Role retrieved successfully.', { role });
    } catch (error) {
      next(error);
    }
  };

  public getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await roleService.getAllRoles();
      return successResponse(res, 'Roles retrieved successfully.', { roles });
    } catch (error) {
      next(error);
    }
  };

  public updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = roleIdParamSchema.parse(req.params);
      const validated = updateRoleSchema.parse(req.body);
      const role = await roleService.updateRole(id, validated);
      return successResponse(res, 'Role updated successfully.', { role });
    } catch (error) {
      next(error);
    }
  };

  public deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = roleIdParamSchema.parse(req.params);
      const role = await roleService.deleteRole(id);
      return successResponse(res, 'Role deleted successfully.', { role });
    } catch (error) {
      next(error);
    }
  };
}
