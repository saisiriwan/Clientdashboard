# 🚀 API Client Setup Guide

## 📦 Required Dependencies

### **ติดตั้ง Dependencies:**

```bash
npm install axios
# หรือ
yarn add axios
# หรือ
pnpm add axios
```

### **TypeScript Types (ถ้ายังไม่มี):**

```bash
npm install -D @types/react @types/node
```

---

## 📁 โครงสร้างไฟล์ที่สร้างแล้ว

```
src/
├── api/
│   ├── client.ts              ✅ Base API client (Axios)
│   ├── types.ts               ✅ TypeScript types
│   ├── auth.ts                ✅ Authentication APIs
│   ├── trainee.ts             ✅ Trainee APIs (7 endpoints)
│   └── README.md              ✅ Documentation
├── hooks/
│   ├── useTrainee.ts          ✅ Trainee data hooks (8 hooks)
│   └── useNotifications.ts    ✅ Notification hooks (3 hooks)
├── contexts/
│   └── AuthContext.tsx        ✅ Auth context provider
├── utils/
│   └── api-error.ts           ✅ Error handling utilities
└── constants/
    └── api.ts                 ✅ API constants
```

---

## 🔧 Setup Steps

### **1. สร้าง Environment Variables:**

สร้างไฟล์ `.env` หรือ `.env.local` ใน root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

### **2. Setup AuthProvider ใน App:**

```tsx
// src/App.tsx
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Your app routes */}
      </AuthProvider>
    </Router>
  );
}

export default App;
```

---

### **3. ทดสอบการเชื่อมต่อ:**

สร้างไฟล์ `src/pages/TestAPI.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { authAPI } from '../api/auth';
import { traineeAPI } from '../api/trainee';

export function TestAPI() {
  const [status, setStatus] = useState<string>('Testing...');

  useEffect(() => {
    const test = async () => {
      try {
        // Test authentication
        const user = await authAPI.me();
        setStatus(`Connected! User: ${user.name}`);

        // Test trainee API
        const stats = await traineeAPI.getStats();
        console.log('Stats:', stats);
      } catch (error: any) {
        setStatus(`Error: ${error.message}`);
      }
    };

    test();
  }, []);

  return (
    <div>
      <h1>API Connection Test</h1>
      <p>{status}</p>
    </div>
  );
}
```

---

## 📝 Quick Usage Examples

### **Example 1: Login Page**

```tsx
// src/pages/Login.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utils/api-error';

export function Login() {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <button onClick={loginWithGoogle}>
        Login with Google
      </button>
    </div>
  );
}
```

---

### **Example 2: Dashboard**

```tsx
// src/pages/Dashboard.tsx
import { useAuth } from '../contexts/AuthContext';
import { useTraineeStats, useUpcomingSchedules } from '../hooks/useTrainee';
import { useUnreadCount } from '../hooks/useNotifications';

export function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useTraineeStats();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingSchedules(7);
  const { count: unreadCount } = useUnreadCount();

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user?.name}!</h1>
        <div className="notifications-badge">{unreadCount} unread</div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          {statsLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="stat-value">{stats?.totalSessions || 0}</p>
          )}
        </div>

        <div className="stat-card">
          <h3>Current Streak</h3>
          {statsLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="stat-value">{stats?.currentStreak || 0} days</p>
          )}
        </div>

        <div className="stat-card">
          <h3>Total Hours</h3>
          {statsLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="stat-value">{stats?.totalWorkoutHours?.toFixed(1) || 0} hrs</p>
          )}
        </div>
      </section>

      <section className="upcoming-sessions">
        <h2>Upcoming Sessions</h2>
        {upcomingLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="sessions-list">
            {upcoming?.upcomingSessions.map((session) => (
              <div key={session.id} className="session-card">
                <h3>{session.title}</h3>
                <p>{session.date} at {session.time}</p>
                <p>Trainer: {session.trainer.name}</p>
                <p>Duration: {session.duration} min</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

---

### **Example 3: Notifications Page**

```tsx
// src/pages/Notifications.tsx
import { useNotifications } from '../hooks/useNotifications';

export function Notifications() {
  const {
    data,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ unreadOnly: false });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="notifications-page">
      <header>
        <h1>Notifications</h1>
        <button onClick={() => markAllAsRead()}>
          Mark All as Read ({data?.unreadCount})
        </button>
      </header>

      <div className="notifications-list">
        {data?.notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${notification.isRead ? 'read' : 'unread'}`}
          >
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
            {!notification.isRead && (
              <button onClick={() => markAsRead(notification.id)}>
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔐 Protected Routes

```tsx
// src/components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('trainer' | 'trainee')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}

// Usage in routes:
<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={['trainee']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🎨 Loading & Error Components

```tsx
// src/components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="spinner">
      <div className="spinner-circle"></div>
    </div>
  );
}

// src/components/ErrorAlert.tsx
interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="error-alert">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
```

---

## 📊 TypeScript Intellisense

```tsx
import type {
  User,
  TraineeStats,
  UpcomingResponse,
  Notification,
  ScheduleDetail,
  CurrentProgram,
} from './api/types';

// ✅ Full type safety and auto-completion
const stats: TraineeStats = await traineeAPI.getStats();
const user: User = await authAPI.me();
```

---

## 🔧 Troubleshooting

### **Problem 1: CORS Error**

```
Access to XMLHttpRequest at 'http://localhost:8080/api/v1/auth/me' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
ตรวจสอบว่า Backend มี CORS configuration:

```go
// main.go (Backend)
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:5173"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Origin", "Content-Type"},
    AllowCredentials: true,
}))
```

---

### **Problem 2: Cookie ไม่ส่งไป**

**Solution:**
ตรวจสอบว่า `withCredentials: true` ตั้งค่าแล้ว:

```tsx
// src/api/client.ts
const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ← สำคัญ!
});
```

---

### **Problem 3: 401 Unauthorized**

**Solution:**
1. Login ก่อน: `await authAPI.login({ username, password })`
2. ตรวจสอบ Cookie ใน DevTools → Application → Cookies
3. ตรวจสอบว่า Backend ส่ง Cookie มา

---

## ✅ Checklist

### **Setup:**
- [ ] ติดตั้ง axios
- [ ] สร้าง .env file
- [ ] Setup AuthProvider ใน App.tsx
- [ ] สร้าง ProtectedRoute component

### **Testing:**
- [ ] ทดสอบ Login
- [ ] ทดสอบ useTraineeStats hook
- [ ] ทดสอบ useUpcomingSchedules hook
- [ ] ทดสอบ useNotifications hook

### **Production:**
- [ ] Update API_BASE_URL สำหรับ production
- [ ] เพิ่ม Error Boundary
- [ ] เพิ่ม Loading Skeletons
- [ ] Setup Error Tracking (Sentry)

---

## 📚 Next Steps

1. ✅ อ่าน [API Documentation](./src/api/README.md)
2. ✅ ดู [Examples](./src/api/README.md#examples)
3. ✅ ทดสอบทุก API endpoints
4. ✅ เพิ่ม Unit Tests สำหรับ API client

---

**Created**: 2026-01-10  
**Version**: 1.0.0  
**Status**: ✅ Ready for Integration
