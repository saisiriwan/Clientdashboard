/**
 * Authentication API
 */

import { api } from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from './types';

/**
 * Auth API Class
 */
export class AuthAPI {
  /**
   * Login with username/password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    localStorage.clear();
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<User> {
    return await api.post<User>(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  /**
   * Get current authenticated user
   */
  async me(): Promise<User> {
    return await api.get<User>(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Login with Google (redirect to Google OAuth)
   */
  loginWithGoogle(): void {
    window.location.href = `${api.getAxiosInstance().defaults.baseURL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
  }

  /**
   * Check if user is authenticated (client-side check)
   */
  isAuthenticated(): boolean {
    // Check if user data exists in localStorage
    const user = localStorage.getItem('user');
    return !!user;
  }

  /**
   * Get user from localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Store user in localStorage
   */
  setStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear stored user
   */
  clearStoredUser(): void {
    localStorage.removeItem('user');
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
