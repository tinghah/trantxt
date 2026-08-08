import { ReactNode } from 'react';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
  }
}

export {};
