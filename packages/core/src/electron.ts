/**
 * Prompt Optimizer - Electron/Node.js specific exports
 * These exports use Node.js-only modules (fs, path) and should only be used in Electron environment
 */

// File storage provider - requires Node.js fs/promises and path modules
export { FileStorageProvider } from './services/storage/fileStorageProvider'
