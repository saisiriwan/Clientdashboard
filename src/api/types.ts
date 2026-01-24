/**
 * TypeScript Type Definitions for API
 */

// ==========================================
// Common Types
// ==========================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: APIError;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ==========================================
// Authentication Types
// ==========================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'trainer' | 'trainee';
  profileImage?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: 'trainer' | 'trainee';
}

// ==========================================
// Trainee Types
// ==========================================

// Upcoming Schedules
export interface UpcomingSession {
  id: number;
  date: string;
  time: string;
  duration: number;
  title: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  trainer: Trainer;
  location: Location;
}

export interface Trainer {
  id: number;
  name: string;
  profileImage?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string[];
}

export interface Location {
  id?: number;
  name: string;
  address?: string;
  floor?: string;
  building?: string;
  mapUrl?: string;
}

export interface CalendarDay {
  date: string;
  dayName: string;
  isToday: boolean;
  hasSession: boolean;
  sessionCount: number;
}

export interface UpcomingResponse {
  upcomingSessions: UpcomingSession[];
  calendar: CalendarDay[];
}

// Schedule Detail
export interface ScheduleDetail {
  id: number;
  date: string;
  time: string;
  duration: number;
  title: string;
  description?: string;
  status: string;
  trainer: Trainer;
  location: Location;
  sessionType?: string;
  plannedExercises?: string[];
  notes?: string;
  relatedSessionCard?: number;
  createdAt: string;
  updatedAt: string;
}

// Current Program
export interface CurrentProgram {
  id: number;
  name: string;
  description?: string;
  duration: string;
  currentWeek: number;
  totalWeeks: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  trainer: Trainer;
  sessionsCompleted: number;
  totalSessions: number;
  sessionCompletionRate: number;
  nextSession?: NextSession;
  goals?: string[];
  weeklySchedule?: WeeklySchedule[];
  progressNotes?: ProgressNote[];
  createdAt: string;
  updatedAt: string;
}

export interface NextSession {
  id: number;
  date: string;
  time: string;
  title: string;
  exercises?: string[];
}

export interface WeeklySchedule {
  day: string;
  focus: string;
  duration: number;
}

export interface ProgressNote {
  week: number;
  date: string;
  note: string;
  recordedBy: string;
}

// Trainee Stats
export interface TraineeStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkoutHours: number;
  averageSessionsPerWeek: number;
  currentProgram?: ProgramSummary;
  recentAchievements?: Achievement[];
}

export interface ProgramSummary {
  id: number;
  name: string;
  progressPercentage: number;
  currentWeek: number;
  totalWeeks: number;
}

export interface Achievement {
  id: number;
  title: string;
  date: string;
  badge: string;
}

// Notifications
export interface Notification {
  id: number;
  type: 'schedule' | 'progress' | 'achievement' | 'system';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: Pagination;
  unreadCount: number;
}

export interface NotificationFilters {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
  type?: 'schedule' | 'progress' | 'achievement' | 'system';
}

// Session Card
export interface SessionCard {
  id: number;
  scheduleId: number;
  date: string;
  title: string;
  duration: number;
  trainer: Trainer;
  exercises: Exercise[];
  overallFeedback?: string;
  nextSessionGoals?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  rest?: number;
  completed: boolean;
  // เพิ่มข้อมูลสำหรับ Cardio และ Duration-based exercises
  distance?: number; // สำหรับ Running, Cycling (เมตร)
  pace?: number; // สำหรับ Running (นาที/กิโลเมตร)
  speed?: number; // สำหรับ Cycling (กม./ชม.)
  calories?: number; // แคลอรี่ที่เผาผลาญ
  heartRate?: number; // อัตราการเต้นหัวใจ
  notes?: string; // หมายเหตุเพิ่มเติม
}

// เพิ่ม Exercise Type Enum - ปรับให้ตรงกับมาตรฐานการฝึก
export type ExerciseType = 
  | 'weight_training' // เวทเทรนนิ่ง (Weight Training / Strength Training)
  | 'cardio' // คาร์ดิโอ (Cardio / Aerobic Exercise)
  | 'flexibility'; // เฟล็กซ์ (Flexibility / Mobility)

export interface ExerciseMetadata {
  type: ExerciseType;
  primaryMetric: 'weight' | 'distance' | 'duration' | 'reps'; // ตัวชี้วัดหลัก
  unit?: string; // หน่วยวัด (kg, km, นาที, ครั้ง)
  targetZone?: 'strength' | 'endurance' | 'cardio' | 'flexibility'; // โซนเป้าหมาย
  isBodyweight?: boolean; // true ถ้าเป็นท่าใช้น้ำหนักตัว (สำหรับ weight_training)
  intensity?: 'low' | 'medium' | 'high'; // ระดับความเข้มข้น
  recommendedFrequency?: string; // ความถี่ที่แนะนำ เช่น "2-4 ครั้ง/สัปดาห์"
}

// ปรับ Exercise interface
export interface Exercise {
  id: number;
  name: string;
  category?: string;
  type: ExerciseType; // เพิ่ม type
  metadata?: ExerciseMetadata; // เพิ่ม metadata
  sets: ExerciseSet[];
  notes?: string;
  totalVolume?: number; // ปริมาณรวม (weight × reps × sets หรือ total distance/duration)
  personalBest?: number; // สถิติส่วนตัว
}

// Metrics
export interface Metric {
  id: number;
  date: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'measurement';
  value: number;
  unit: string;
  notes?: string;
}

// ==========================================
// Trainer Types
// ==========================================

export interface Client {
  id: number;
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  joinDate: string;
  currentProgram?: string;
  totalSessions: number;
  lastSessionDate?: string;
  status: 'active' | 'inactive';
}

export interface DashboardStats {
  totalClients: number;
  activePrograms: number;
  todaySessions: number;
  weekSessions: number;
  completionRate: number;
  upcomingSchedules: UpcomingSession[];
}

// ==========================================
// Query Parameters
// ==========================================

export interface ScheduleFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  trainerId?: number;
  clientId?: number;
}

export interface ProgramFilters {
  status?: 'active' | 'completed' | 'paused';
  clientId?: number;
}

export interface SessionFilters {
  clientId?: number;
  startDate?: string;
  endDate?: string;
}