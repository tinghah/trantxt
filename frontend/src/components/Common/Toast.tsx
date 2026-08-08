import { useEffect } from 'react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';

export const Toast = () => {
  return <Toaster position="top-right" />;
};

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  promise: (promise: Promise<any>, messages: any) => toast.promise(promise, messages),
};
