import { useState, useCallback } from 'react';
import api from '../services/api';
import { UploadProgress, UploadResponse } from '../types';

export interface UploadOptions {
  targetLanguage?: string;
  outputFormat?: string;
}

export const useUpload = () => {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (files: File[], options?: UploadOptions): Promise<UploadResponse[]> => {
      const results: UploadResponse[] = [];
      setError(null);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      if (options?.targetLanguage) {
        formData.append('targetLanguage', options.targetLanguage);
      }
      if (options?.outputFormat) {
        formData.append('outputFormat', options.outputFormat);
      }

      const fileId = files.map((f) => f.name).join('+') + Date.now();
      setUploads((prev) => ({
        ...prev,
        [fileId]: {
          fileName: files.map((f) => f.name).join(', '),
          progress: 0,
          status: 'uploading',
        },
      }));

      try {
        const response = await api.post('/api/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploads((prev) => ({
              ...prev,
              [fileId]: { ...prev[fileId], progress: percentCompleted },
            }));
          },
        });

        const data = response.data.data;
        const docs = Array.isArray(data) ? data : data?.documents || [];
        results.push(...docs);

        setUploads((prev) => ({
          ...prev,
          [fileId]: {
            fileName: files.map((f) => f.name).join(', '),
            progress: 100,
            status: 'completed',
          },
        }));
      } catch (err: any) {
        const message = err.response?.data?.message || err.response?.data?.error || 'Upload failed';
        setError(message);
        setUploads((prev) => ({
          ...prev,
          [fileId]: {
            fileName: files.map((f) => f.name).join(', '),
            progress: 0,
            status: 'failed',
            error: message,
          },
        }));
      }

      return results;
    },
    []
  );

  const clearProgress = useCallback(() => {
    setUploads({});
  }, []);

  return { uploads, error, upload, clearProgress };
};
