/**
 * React Hooks for Notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { traineeAPI } from '../api/trainee';
import type { NotificationsResponse, NotificationFilters, Notification } from '../api/types';
import { getErrorMessage } from '../utils/api-error';

interface UseNotificationsState {
  data: NotificationsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markingAsRead: boolean;
}

/**
 * Notifications Hook with full functionality
 */
export function useNotifications(
  filters?: NotificationFilters
): UseNotificationsState {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  /**
   * Fetch notifications
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getNotifications(filters);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Mark single notification as read
   */
  const markAsRead = useCallback(
    async (id: number) => {
      try {
        setMarkingAsRead(true);
        await traineeAPI.markNotificationAsRead(id);

        // Update local state
        if (data) {
          setData({
            ...data,
            notifications: data.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, data.unreadCount - 1),
          });
        }
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setMarkingAsRead(false);
      }
    },
    [data]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      setMarkingAsRead(true);
      await traineeAPI.markAllNotificationsAsRead();

      // Update local state
      if (data) {
        setData({
          ...data,
          notifications: data.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setMarkingAsRead(false);
    }
  }, [data]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    markAsRead,
    markAllAsRead,
    markingAsRead,
  };
}

/**
 * Unread Count Hook (lightweight)
 */
export function useUnreadCount(): {
  count: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await traineeAPI.getNotifications({ limit: 1, unreadOnly: true });
      setCount(response.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    count,
    isLoading,
    refetch: fetchCount,
  };
}

/**
 * Single Notification Hook
 */
export function useNotification(id: number | null): {
  notification: Notification | null;
  isLoading: boolean;
  markAsRead: () => Promise<void>;
} {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchNotification = async () => {
      try {
        setIsLoading(true);
        const response = await traineeAPI.getNotifications({ limit: 100 });
        const found = response.notifications.find((n) => n.id === id);
        setNotification(found || null);
      } catch (err) {
        console.error('Failed to fetch notification:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  const markAsRead = useCallback(async () => {
    if (!id) return;

    try {
      await traineeAPI.markNotificationAsRead(id);
      if (notification) {
        setNotification({ ...notification, isRead: true });
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
      throw err;
    }
  }, [id, notification]);

  return {
    notification,
    isLoading,
    markAsRead,
  };
}
