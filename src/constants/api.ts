/**
 * API Configuration Constants
 */

// Base API URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    GOOGLE_LOGIN: '/auth/google/login',
    GOOGLE_CALLBACK: '/auth/google/callback',
  },

  // Trainee Endpoints (Read-Only)
  TRAINEE: {
    SCHEDULES_UPCOMING: '/trainee/schedules/upcoming',
    SCHEDULE_DETAIL: (id: number) => `/trainee/schedules/${id}`,
    PROGRAMS_CURRENT: '/trainee/programs/current',
    PROGRAMS_LIST: '/trainee/programs',
    PROGRAM_DETAIL: (id: number) => `/trainee/programs/${id}`,
    STATS: '/trainee/stats',
    NOTIFICATIONS: '/trainee/notifications',
    NOTIFICATION_READ: (id: number) => `/trainee/notifications/${id}/read`,
    NOTIFICATIONS_READ_ALL: '/trainee/notifications/read-all',
    PROFILE: '/trainee/me',
    SCHEDULES: '/trainee/schedules',
    SESSIONS: '/trainee/sessions',
    SESSION_DETAIL: (id: number) => `/trainee/sessions/${id}`,
    METRICS: '/trainee/metrics',
  },

  // Trainer Endpoints (Full CRUD)
  TRAINER: {
    DASHBOARD_STATS: '/trainer/dashboard/stats',
    CLIENTS: '/trainer/clients',
    CLIENT_DETAIL: (id: number) => `/trainer/clients/${id}`,
    CLIENT_METRICS: (id: number) => `/trainer/clients/${id}/metrics`,
    CLIENT_SESSIONS: (id: number) => `/trainer/clients/${id}/sessions`,
    SCHEDULES: '/trainer/schedules',
    SCHEDULE_DETAIL: (id: number) => `/trainer/schedules/${id}`,
    SESSIONS: '/trainer/sessions',
    SESSION_DETAIL: (id: number) => `/trainer/sessions/${id}`,
    PROGRAMS: '/trainer/programs',
    PROGRAM_DETAIL: (id: number) => `/trainer/programs/${id}`,
    EXERCISES: '/trainer/exercises',
  },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
} as const;
