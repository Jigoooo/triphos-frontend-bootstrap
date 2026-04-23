import '@tanstack/react-query';
import type { AxiosError } from 'axios';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError;
  }
}

declare global {
  interface Window {
    platform?: 'android' | 'ios';
    toggleDevtools?: () => void;
  }
}
