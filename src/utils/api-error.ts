/**
 * API Error Handling Utilities
 */

import { ERROR_CODES } from '../constants/api';
import type { APIError } from '../api/types';

export class APIException extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'APIException';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * แปลง Axios Error เป็น APIException
 */
export function handleAPIError(error: any): APIException {
  // Network Error
  if (!error.response) {
    return new APIException(
      ERROR_CODES.NETWORK_ERROR,
      'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      0
    );
  }

  const { status, data } = error.response;

  // Backend API Error Response
  if (data && data.error) {
    return new APIException(
      data.error.code || ERROR_CODES.INTERNAL_ERROR,
      data.error.message || 'เกิดข้อผิดพลาด',
      status,
      data.error.details
    );
  }

  // HTTP Status Error
  switch (status) {
    case 401:
      return new APIException(
        ERROR_CODES.UNAUTHORIZED,
        'กรุณาเข้าสู่ระบบ',
        401
      );
    case 403:
      return new APIException(
        ERROR_CODES.FORBIDDEN,
        'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
        403
      );
    case 404:
      return new APIException(
        ERROR_CODES.NOT_FOUND,
        'ไม่พบข้อมูลที่ต้องการ',
        404
      );
    case 422:
      return new APIException(
        ERROR_CODES.INVALID_INPUT,
        'ข้อมูลไม่ถูกต้อง',
        422,
        data
      );
    case 500:
      return new APIException(
        ERROR_CODES.INTERNAL_ERROR,
        'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        500
      );
    default:
      return new APIException(
        ERROR_CODES.INTERNAL_ERROR,
        data.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        status
      );
  }
}

/**
 * ตรวจสอบว่าเป็น Unauthorized Error หรือไม่
 */
export function isUnauthorizedError(error: APIException): boolean {
  return error.code === ERROR_CODES.UNAUTHORIZED || error.statusCode === 401;
}

/**
 * ตรวจสอบว่าเป็น Forbidden Error หรือไม่
 */
export function isForbiddenError(error: APIException): boolean {
  return error.code === ERROR_CODES.FORBIDDEN || error.statusCode === 403;
}

/**
 * ตรวจสอบว่าเป็น Not Found Error หรือไม่
 */
export function isNotFoundError(error: APIException): boolean {
  return error.code === ERROR_CODES.NOT_FOUND || error.statusCode === 404;
}

/**
 * ตรวจสอบว่าเป็น Network Error หรือไม่
 */
export function isNetworkError(error: APIException): boolean {
  return error.code === ERROR_CODES.NETWORK_ERROR;
}

/**
 * แสดง Error Message ที่เหมาะสมกับผู้ใช้
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIException) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

/**
 * Log Error (สามารถส่งไปยัง Error Tracking Service เช่น Sentry)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', context || '', error);
  }

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // Example:
  // Sentry.captureException(error, { tags: { context } });
}

/**
 * Retry failed request
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error instanceof APIException && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}
