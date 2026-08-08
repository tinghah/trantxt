import { useState, useCallback } from 'react';
import api from '../services/api';

interface UseApiOptions {
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

export const useApi = <T,>(options?: UseApiOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (method: string, url: string, payload?: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api({
          method,
          url,
          data: payload,
        });
        const result = response.data.data;
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const message = err.response?.data?.error || 'An error occurred';
        setError(message);
        options?.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const get = useCallback((url: string) => request('GET', url), [request]);
  const post = useCallback((url: string, payload: any) => request('POST', url, payload), [request]);
  const put = useCallback((url: string, payload: any) => request('PUT', url, payload), [request]);
  const del = useCallback((url: string) => request('DELETE', url), [request]);

  return { data, isLoading, error, get, post, put, del };
};
