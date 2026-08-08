import { useState, useCallback } from 'react';
import api from '../services/api';
import { UploadProgress, UploadResponse } from '../types';

export const useUpload = () => {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (files: File[]): Promise<UploadResponse[]> => {
      const results: UploadResponse[] = [];
      setError(null);

      for (const file of files) {
        const fileId = file.name + Date.now();
        setUploads((prev) => ({
          ...prev,
          [fileId]: { fileName: file.name, progress: 0, status: 'uploading' },
        }));

        try {
          const formData = new FormData();
          formData.append('file', file);

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

          const uploadResponse = response.data.data;
          results.push(uploadResponse);

          setUploads((prev) => ({
            ...prev,
            [fileId]: { fileName: file.name, progress: 100, status: 'completed' },
          }));
        } catch (err: any) {
          const message = err.response?.data?.error || 'Upload failed';
          setError(message);
          setUploads((prev) => ({
            ...prev,
            [fileId]: { fileName: file.name, progress: 0, status: 'failed', error: message },
          }));
        }
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
