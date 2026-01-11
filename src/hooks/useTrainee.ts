/**
 * React Hooks for Trainee APIs
 */

import { useState, useEffect, useCallback } from 'react';
import { traineeAPI } from '../api/trainee';
import type {
  UpcomingResponse,
  ScheduleDetail,
  CurrentProgram,
  TraineeStats,
  SessionCard,
  Metric,
  ScheduleFilters,
  SessionFilters,
} from '../api/types';
import { APIException, getErrorMessage } from '../utils/api-error';

interface UseTraineeState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ==========================================
// 1. Upcoming Schedules Hook
// ==========================================

export function useUpcomingSchedules(days: number = 7): UseTraineeState<UpcomingResponse> {
  const [data, setData] = useState<UpcomingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getUpcomingSchedules(days);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ==========================================
// 2. Schedule Detail Hook
// ==========================================

export function useScheduleDetail(id: number | null): UseTraineeState<ScheduleDetail> {
  const [data, setData] = useState<ScheduleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getScheduleDetail(id);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ==========================================
// 3. Schedules List Hook
// ==========================================

export function useSchedules(filters?: ScheduleFilters): UseTraineeState<ScheduleDetail[]> {
  const [data, setData] = useState<ScheduleDetail[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getSchedules(filters);
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

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ==========================================
// 4. Current Program Hook
// ==========================================

export function useCurrentProgram(): UseTraineeState<CurrentProgram> {
  const [data, setData] = useState<CurrentProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getCurrentProgram();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ==========================================
// 5. Trainee Stats Hook
// ==========================================

export function useTraineeStats(): UseTraineeState<TraineeStats> {
  const [data, setData] = useState<TraineeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getStats();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ==========================================
// 6. Sessions Hook
// ==========================================

export function useSessions(filters?: SessionFilters): UseTraineeState<SessionCard[]> {
  const [data, setData] = useState<SessionCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getSessions(filters);
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

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ==========================================
// 7. Session Detail Hook
// ==========================================

export function useSessionDetail(id: number | null): UseTraineeState<SessionCard> {
  const [data, setData] = useState<SessionCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getSessionDetail(id);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ==========================================
// 8. Metrics Hook
// ==========================================

export function useMetrics(): UseTraineeState<Metric[]> {
  const [data, setData] = useState<Metric[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await traineeAPI.getMetrics();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
