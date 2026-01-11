/**
 * Trainee API (Read-Only for Trainee Users)
 */

import { api } from './client';
import { API_ENDPOINTS } from '../constants/api';
import type {
  UpcomingResponse,
  ScheduleDetail,
  CurrentProgram,
  TraineeStats,
  NotificationsResponse,
  NotificationFilters,
  SessionCard,
  Metric,
  ScheduleFilters,
  SessionFilters,
  User,
} from './types';

/**
 * Trainee API Class
 */
export class TraineeAPI {
  // ==========================================
  // 1. Schedules
  // ==========================================

  /**
   * GET /trainee/schedules/upcoming
   * ดึงนัดหมาย 7 วันข้างหน้า (หรือระบุจำนวนวันเอง)
   */
  async getUpcomingSchedules(days: number = 7): Promise<UpcomingResponse> {
    return await api.get<UpcomingResponse>(API_ENDPOINTS.TRAINEE.SCHEDULES_UPCOMING, {
      params: { days },
    });
  }

  /**
   * GET /trainee/schedules/:id
   * ดึงรายละเอียดนัดหมายทีละรายการ
   */
  async getScheduleDetail(id: number): Promise<ScheduleDetail> {
    return await api.get<ScheduleDetail>(API_ENDPOINTS.TRAINEE.SCHEDULE_DETAIL(id));
  }

  /**
   * GET /trainee/schedules
   * ดึงตารางนัดหมายทั้งหมด (with filters)
   */
  async getSchedules(filters?: ScheduleFilters): Promise<ScheduleDetail[]> {
    return await api.get<ScheduleDetail[]>(API_ENDPOINTS.TRAINEE.SCHEDULES, {
      params: filters,
    });
  }

  // ==========================================
  // 2. Programs
  // ==========================================

  /**
   * GET /trainee/programs/current
   * ดึงโปรแกรมปัจจุบันของ Trainee
   */
  async getCurrentProgram(): Promise<CurrentProgram> {
    return await api.get<CurrentProgram>(API_ENDPOINTS.TRAINEE.PROGRAMS_CURRENT);
  }

  /**
   * GET /trainee/programs
   * ดึงรายการโปรแกรมทั้งหมด
   */
  async getPrograms(): Promise<CurrentProgram[]> {
    return await api.get<CurrentProgram[]>(API_ENDPOINTS.TRAINEE.PROGRAMS_LIST);
  }

  /**
   * GET /trainee/programs/:id
   * ดึงรายละเอียดโปรแกรม
   */
  async getProgramDetail(id: number): Promise<CurrentProgram> {
    return await api.get<CurrentProgram>(API_ENDPOINTS.TRAINEE.PROGRAM_DETAIL(id));
  }

  // ==========================================
  // 3. Stats
  // ==========================================

  /**
   * GET /trainee/stats
   * ดึงสถิติสรุปของ Trainee
   */
  async getStats(): Promise<TraineeStats> {
    return await api.get<TraineeStats>(API_ENDPOINTS.TRAINEE.STATS);
  }

  // ==========================================
  // 4. Notifications
  // ==========================================

  /**
   * GET /trainee/notifications
   * ดึงการแจ้งเตือนทั้งหมด (with pagination & filters)
   */
  async getNotifications(filters?: NotificationFilters): Promise<NotificationsResponse> {
    return await api.get<NotificationsResponse>(API_ENDPOINTS.TRAINEE.NOTIFICATIONS, {
      params: filters,
    });
  }

  /**
   * PUT /trainee/notifications/:id/read
   * Mark notification as read
   */
  async markNotificationAsRead(id: number): Promise<void> {
    await api.put(API_ENDPOINTS.TRAINEE.NOTIFICATION_READ(id));
  }

  /**
   * PUT /trainee/notifications/read-all
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<{ markedCount: number }> {
    return await api.put<{ markedCount: number }>(API_ENDPOINTS.TRAINEE.NOTIFICATIONS_READ_ALL);
  }

  // ==========================================
  // 5. Profile
  // ==========================================

  /**
   * GET /trainee/me
   * ดึงโปรไฟล์ของฉัน
   */
  async getProfile(): Promise<User> {
    return await api.get<User>(API_ENDPOINTS.TRAINEE.PROFILE);
  }

  // ==========================================
  // 6. Session Cards
  // ==========================================

  /**
   * GET /trainee/sessions
   * ดึง Session Cards ทั้งหมด
   */
  async getSessions(filters?: SessionFilters): Promise<SessionCard[]> {
    return await api.get<SessionCard[]>(API_ENDPOINTS.TRAINEE.SESSIONS, {
      params: filters,
    });
  }

  /**
   * GET /trainee/sessions/:id
   * ดึงรายละเอียด Session Card
   */
  async getSessionDetail(id: number): Promise<SessionCard> {
    return await api.get<SessionCard>(API_ENDPOINTS.TRAINEE.SESSION_DETAIL(id));
  }

  // ==========================================
  // 7. Metrics
  // ==========================================

  /**
   * GET /trainee/metrics
   * ดึงข้อมูลการวัดผล
   */
  async getMetrics(): Promise<Metric[]> {
    return await api.get<Metric[]>(API_ENDPOINTS.TRAINEE.METRICS);
  }
}

// Export singleton instance
export const traineeAPI = new TraineeAPI();
