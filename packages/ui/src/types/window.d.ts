import type { ElectronAPI } from './electron'

export {};

declare global {
  interface Window {
    $message?: {
      success: (content: string) => void;
      error?: (content: string) => void;
      warning?: (content: string) => void;
      info?: (content: string) => void;
    };
    electronAPI?: ElectronAPI;
    __TEST_DB_NAME__?: string;
  }
}

