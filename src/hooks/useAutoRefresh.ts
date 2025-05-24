
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number;
}

interface RefreshAfterUpdateOptions {
  redirectTo?: string;
  delay?: number;
}

export function useAutoRefresh(
  callback?: () => void,
  options: UseAutoRefreshOptions = {}
) {
  const { enabled = false, interval = 30000 } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const navigate = useNavigate();

  // Manter callback atualizado
  useEffect(() => {
    if (callback) {
      callbackRef.current = callback;
    }
  }, [callback]);

  useEffect(() => {
    if (!enabled || !callback) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, callback]);

  const start = () => {
    if (!intervalRef.current && callback) {
      intervalRef.current = setInterval(() => {
        if (callbackRef.current) {
          callbackRef.current();
        }
      }, interval);
    }
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const quickRefresh = () => {
    window.location.reload();
  };

  const refreshAfterUpdate = (options: RefreshAfterUpdateOptions = {}) => {
    const { redirectTo, delay = 1000 } = options;
    
    setTimeout(() => {
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        window.location.reload();
      }
    }, delay);
  };

  return { 
    start, 
    stop, 
    quickRefresh, 
    refreshAfterUpdate 
  };
}
