import { Request, Response, NextFunction } from 'express';
import { logger } from '@/config/logger';
import { errorResponse } from '@/utils/api-response';

export class AppError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(message: string, statusCode = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${req.method} ${req.path} - Status: ${statusCode} - Error: ${message}`);
  if (statusCode === 500) {
    logger.error(err.stack || '');
  }

  const errors = err.errors || (process.env.NODE_ENV === 'development' && err.stack ? [err.stack] : []);

  return errorResponse(res, message, errors, statusCode);
};
