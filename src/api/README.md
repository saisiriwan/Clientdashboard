# 🌐 Frontend API Client Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [API Modules](#api-modules)
5. [React Hooks](#react-hooks)
6. [Authentication](#authentication)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## 🎯 Overview

**TypeScript API Client** สำหรับเชื่อมต่อกับ Fitness Training System Backend

### **Features:**
- ✅ Type-safe with TypeScript
- ✅ Axios-based HTTP client
- ✅ React Hooks for data fetching
- ✅ Authentication with JWT Cookies
- ✅ Automatic error handling
- ✅ Request/Response interceptors
- ✅ Loading states & error messages

---

## 📦 Installation

### **1. ติดตั้ง Dependencies:**
```bash
npm install axios
# หรือ
yarn add axios
```

### **2. Setup Environment Variables:**
สร้างไฟล์ `.env` หรือ `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🚀 Quick Start

### **1. Setup AuthProvider:**
```tsx
// App.tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### **2. Use in Components:**
```tsx
// Example: Dashboard.tsx
import { useAuth } from './contexts/AuthContext';
import { useTraineeStats } from './hooks/useTrainee';

function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useTraineeStats();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Total Sessions: {data?.totalSessions}</p>
    </div>
  );
}
```

---

## 📚 API Modules

### **1. Authentication (`auth.ts`)**

```tsx
import { authAPI } from './api/auth';

// Login
const response = await authAPI.login({
  username: 'somchai',
  password: 'password123',
});

// Logout
await authAPI.logout();

// Get current user
const user = await authAPI.me();

// Login with Google
authAPI.loginWithGoogle();
```

---

### **2. Trainee APIs (`trainee.ts`)**

#### **Schedules:**
```tsx
import { traineeAPI } from './api/trainee';

// Get upcoming schedules (7 days)
const upcoming = await traineeAPI.getUpcomingSchedules(7);

// Get schedule detail
const schedule = await traineeAPI.getScheduleDetail(1);

// Get all schedules with filters
const schedules = await traineeAPI.getSchedules({
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  status: 'confirmed',
});
```

#### **Programs:**
```tsx
// Get current program
const program = await traineeAPI.getCurrentProgram();

// Get all programs
const programs = await traineeAPI.getPrograms();

// Get program detail
const detail = await traineeAPI.getProgramDetail(1);
```

#### **Stats:**
```tsx
// Get trainee stats
const stats = await traineeAPI.getStats();
console.log(stats.totalSessions); // 124
console.log(stats.currentStreak); // 5
```

#### **Notifications:**
```tsx
// Get notifications
const notifications = await traineeAPI.getNotifications({
  limit: 20,
  page: 1,
  unreadOnly: true,
  type: 'schedule',
});

// Mark as read
await traineeAPI.markNotificationAsRead(1);

// Mark all as read
await traineeAPI.markAllNotificationsAsRead();
```

#### **Sessions:**
```tsx
// Get session cards
const sessions = await traineeAPI.getSessions({
  startDate: '2026-01-01',
});

// Get session detail
const session = await traineeAPI.getSessionDetail(1);
```

#### **Metrics:**
```tsx
// Get metrics
const metrics = await traineeAPI.getMetrics();
```

---

## 🎣 React Hooks

### **1. Authentication Hook:**
```tsx
import { useAuth } from './contexts/AuthContext';

function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'user', password: 'pass' });
      // Success - redirect to dashboard
    } catch (err) {
      // Error handled automatically
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

---

### **2. Trainee Hooks:**

#### **Upcoming Schedules:**
```tsx
import { useUpcomingSchedules } from './hooks/useTrainee';

function SchedulePage() {
  const { data, isLoading, error, refetch } = useUpcomingSchedules(7);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      {data?.upcomingSessions.map(session => (
        <ScheduleCard key={session.id} session={session} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

#### **Schedule Detail:**
```tsx
import { useScheduleDetail } from './hooks/useTrainee';

function ScheduleDetailPage({ scheduleId }: { scheduleId: number }) {
  const { data, isLoading, error } = useScheduleDetail(scheduleId);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <h1>{data?.title}</h1>
      <p>Date: {data?.date}</p>
      <p>Time: {data?.time}</p>
      <p>Trainer: {data?.trainer.name}</p>
    </div>
  );
}
```

#### **Current Program:**
```tsx
import { useCurrentProgram } from './hooks/useTrainee';

function ProgramPage() {
  const { data, isLoading, error } = useCurrentProgram();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <h1>{data?.name}</h1>
      <ProgressBar value={data?.progressPercentage} />
      <p>Week {data?.currentWeek} of {data?.totalWeeks}</p>
    </div>
  );
}
```

#### **Trainee Stats:**
```tsx
import { useTraineeStats } from './hooks/useTrainee';

function StatsPage() {
  const { data, isLoading, error } = useTraineeStats();

  return (
    <div>
      <StatCard title="Total Sessions" value={data?.totalSessions} />
      <StatCard title="Current Streak" value={data?.currentStreak} />
      <StatCard title="Total Hours" value={data?.totalWorkoutHours} />
    </div>
  );
}
```

---

### **3. Notifications Hooks:**

#### **Full Notifications:**
```tsx
import { useNotifications } from './hooks/useNotifications';

function NotificationsPage() {
  const {
    data,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    markingAsRead,
  } = useNotifications({ unreadOnly: false });

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div>
      <button onClick={handleMarkAllAsRead} disabled={markingAsRead}>
        Mark All as Read
      </button>
      {data?.notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={() => handleMarkAsRead(notification.id)}
        />
      ))}
    </div>
  );
}
```

#### **Unread Count (Lightweight):**
```tsx
import { useUnreadCount } from './hooks/useNotifications';

function NotificationBadge() {
  const { count, isLoading } = useUnreadCount();

  if (isLoading) return null;

  return <Badge count={count} />;
}
```

---

## 🔐 Authentication

### **AuthContext Provider:**

```tsx
// App.tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### **Protected Route:**

```tsx
import { useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}
```

### **Role-Based Access:**

```tsx
function TrainerOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== 'trainer') {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

---

## 🐛 Error Handling

### **1. APIException Class:**
```tsx
import { APIException, getErrorMessage } from './utils/api-error';

try {
  await traineeAPI.getStats();
} catch (error) {
  if (error instanceof APIException) {
    console.log(error.code);        // "UNAUTHORIZED"
    console.log(error.message);     // "กรุณาเข้าสู่ระบบ"
    console.log(error.statusCode);  // 401
  }

  // Get user-friendly message
  const message = getErrorMessage(error);
  alert(message);
}
```

### **2. Error Type Checks:**
```tsx
import {
  isUnauthorizedError,
  isForbiddenError,
  isNotFoundError,
  isNetworkError,
} from './utils/api-error';

try {
  await traineeAPI.getScheduleDetail(999);
} catch (error) {
  if (isUnauthorizedError(error)) {
    // Redirect to login
  } else if (isNotFoundError(error)) {
    // Show 404 page
  } else if (isNetworkError(error)) {
    // Show offline message
  }
}
```

### **3. Global Error Handler:**
```tsx
// ErrorBoundary.tsx
import { useEffect } from 'react';
import { logError } from './utils/api-error';

function ErrorBoundary({ children }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError(event.error, 'Global Error Handler');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return <>{children}</>;
}
```

---

## 📝 Examples

### **Example 1: Login Page**
```tsx
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
      <button type="button" onClick={loginWithGoogle}>
        Login with Google
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

---

### **Example 2: Dashboard with Stats**
```tsx
import { useAuth } from './contexts/AuthContext';
import {
  useTraineeStats,
  useUpcomingSchedules,
  useCurrentProgram,
} from './hooks/useTrainee';
import { useUnreadCount } from './hooks/useNotifications';

function Dashboard() {
  const { user } = useAuth();
  const stats = useTraineeStats();
  const upcoming = useUpcomingSchedules(7);
  const program = useCurrentProgram();
  const { count: unreadCount } = useUnreadCount();

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}!</h1>

      <section className="stats">
        <StatCard
          title="Total Sessions"
          value={stats.data?.totalSessions}
          loading={stats.isLoading}
        />
        <StatCard
          title="Current Streak"
          value={stats.data?.currentStreak}
          loading={stats.isLoading}
        />
        <StatCard
          title="Unread Notifications"
          value={unreadCount}
        />
      </section>

      <section className="program">
        <h2>Current Program</h2>
        {program.isLoading ? (
          <Spinner />
        ) : program.error ? (
          <p>No active program</p>
        ) : (
          <ProgramCard program={program.data} />
        )}
      </section>

      <section className="schedule">
        <h2>Upcoming Sessions</h2>
        {upcoming.data?.upcomingSessions.map(session => (
          <ScheduleCard key={session.id} session={session} />
        ))}
      </section>
    </div>
  );
}
```

---

### **Example 3: Notification Center**
```tsx
import { useNotifications } from './hooks/useNotifications';
import { useState } from 'react';

function NotificationCenter() {
  const [filters, setFilters] = useState({ unreadOnly: false });
  const {
    data,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications(filters);

  return (
    <div className="notification-center">
      <div className="header">
        <h1>Notifications ({data?.unreadCount} unread)</h1>
        <button onClick={() => markAllAsRead()}>
          Mark All as Read
        </button>
      </div>

      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={filters.unreadOnly}
            onChange={(e) => setFilters({ unreadOnly: e.target.checked })}
          />
          Show Unread Only
        </label>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="notifications">
          {data?.notifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification.id)}
            />
          ))}
        </div>
      )}

      <Pagination
        current={data?.pagination.currentPage || 1}
        total={data?.pagination.totalPages || 1}
        onChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
```

---

## 🎯 Best Practices

### **1. Error Handling:**
```tsx
// ❌ Bad
const data = await traineeAPI.getStats();

// ✅ Good
try {
  const data = await traineeAPI.getStats();
} catch (error) {
  console.error(getErrorMessage(error));
}

// ✅ Better - Use hooks (error handling built-in)
const { data, error } = useTraineeStats();
```

### **2. Loading States:**
```tsx
// ✅ Always show loading state
const { data, isLoading } = useTraineeStats();

if (isLoading) return <Spinner />;
return <Stats data={data} />;
```

### **3. Optimistic Updates:**
```tsx
const { markAsRead } = useNotifications();

const handleMarkAsRead = async (id: number) => {
  // Update UI immediately
  setNotifications(prev =>
    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
  );

  try {
    await markAsRead(id);
  } catch (error) {
    // Rollback on error
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: false } : n)
    );
  }
};
```

---

## 📊 Type Safety

```tsx
// ✅ Full TypeScript support
import type { User, TraineeStats, Notification } from './api/types';

const user: User = await authAPI.me();
const stats: TraineeStats = await traineeAPI.getStats();
const notifications: Notification[] = data.notifications;
```

---

## 🚀 Next Steps

1. ✅ Implement error boundaries
2. ✅ Add loading skeletons
3. ✅ Setup React Query (optional, for advanced caching)
4. ✅ Add offline support
5. ✅ Setup error tracking (Sentry)

---

**Created**: 2026-01-10  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
