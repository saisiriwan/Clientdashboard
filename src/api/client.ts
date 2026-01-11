/**
 * Base API Client using Axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants/api';
import { handleAPIError, logError } from '../utils/api-error';
import type { APIResponse } from './types';

/**
 * Create Axios instance with default config
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // สำคัญ! เพื่อส่ง Cookie (JWT) ไปกับทุก request
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      // เพิ่ม Authorization header (ถ้าใช้ Bearer Token แทน Cookie)
      // const token = localStorage.getItem('auth_token');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }

      // Log request ใน development mode
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      logError(error, 'Request Interceptor');
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse<APIResponse>) => {
      // Log response ใน development mode
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
      }

      return response;
    },
    (error) => {
      const apiError = handleAPIError(error);
      logError(apiError, 'Response Interceptor');

      // Auto redirect to login on 401 (Unauthorized)
      if (apiError.statusCode === 401) {
        // Clear local storage
        localStorage.clear();

        // Redirect to login (ถ้าไม่ได้อยู่ที่หน้า login อยู่แล้ว)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Create singleton instance
const apiClient = createAxiosInstance();

/**
 * API Client Class
 */
class APIClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<APIResponse<T>>(url, config);
      return response.data.data as T;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<APIResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<APIResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<APIResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<APIResponse<T>>(url, config);
      return response.data.data as T;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<APIResponse<T>>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data as T;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  /**
   * Get raw response (สำหรับกรณีที่ต้องการ response ทั้งหมด)
   */
  async getRaw<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<APIResponse<T>>> {
    try {
      return await this.client.get<APIResponse<T>>(url, config);
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  /**
   * Set Authorization header (ถ้าใช้ Bearer Token)
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear Authorization header
   */
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Get Axios instance (สำหรับกรณีที่ต้องการใช้ฟังก์ชันพิเศษของ Axios)
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const api = new APIClient(apiClient);

// Export Axios instance for direct access
export { apiClient };

// Export APIClient class for creating custom instances
export { APIClient };
