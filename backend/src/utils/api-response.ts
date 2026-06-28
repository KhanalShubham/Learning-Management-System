import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: any[] | null;
}

/**
 * Send a standardized success API response.
 */
export function successResponse<T>(
  res: Response,
  message: string,
  data: T = null as any,
  statusCode = 200
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
}

/**
 * Send a standardized error API response.
 */
export function errorResponse(
  res: Response,
  message: string,
  errors: any[] | null = [],
  statusCode = 500
): Response<ApiResponse<null>> {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: errors || [],
  });
}
