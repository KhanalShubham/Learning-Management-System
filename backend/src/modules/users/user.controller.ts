import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from './user.validator';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export class UserController {
  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createUserSchema.parse(req.body);
      const user = await userService.createUser(validated);
      return successResponse(res, 'User created successfully.', { user }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const user = await userService.getUserById(id);
      return successResponse(res, 'User retrieved successfully.', { user });
    } catch (error) {
      next(error);
    }
  };

  public getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skip, take } = listUsersQuerySchema.parse(req.query);
      const result = await userService.getAllUsers(skip, take);
      return successResponse(res, 'Users retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const validated = updateUserSchema.parse(req.body);
      const user = await userService.updateUser(id, validated);
      return successResponse(res, 'User updated successfully.', { user });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const user = await userService.deleteUser(id);
      return successResponse(res, 'User deleted successfully.', { user });
    } catch (error) {
      next(error);
    }
  };
}
