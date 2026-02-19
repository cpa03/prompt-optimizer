/**
 * 存储错误类
 */
import { STORAGE_ERROR_CODES, type ErrorParams } from '../../constants/error-codes'
import { type ErrorOptionsWithCause, setErrorCause } from '../llm/errors'

type StorageOperation =
  | 'read'
  | 'write'
  | 'delete'
  | 'clear'
  | 'config'
  | 'lock'
  | 'validation'
  | 'repair'

const STORAGE_OPERATION_TO_CODE: Record<
  StorageOperation,
  (typeof STORAGE_ERROR_CODES)[keyof typeof STORAGE_ERROR_CODES]
> = {
  read: STORAGE_ERROR_CODES.READ_ERROR,
  write: STORAGE_ERROR_CODES.WRITE_ERROR,
  delete: STORAGE_ERROR_CODES.DELETE_ERROR,
  clear: STORAGE_ERROR_CODES.CLEAR_ERROR,
  config: STORAGE_ERROR_CODES.CONFIG_ERROR,
  lock: STORAGE_ERROR_CODES.LOCK_ERROR,
  validation: STORAGE_ERROR_CODES.CONFIG_ERROR, // Use CONFIG_ERROR for validation errors
  repair: STORAGE_ERROR_CODES.CONFIG_ERROR, // Use CONFIG_ERROR for repair errors
}

export class StorageError extends Error {
  public readonly code: string
  public readonly params?: ErrorParams

  constructor(
    message: string,
    public readonly operation: StorageOperation,
    params?: ErrorParams,
    options?: ErrorOptionsWithCause
  ) {
    const code = STORAGE_OPERATION_TO_CODE[operation]
    super(message ? `[${code}] ${message}` : `[${code}]`)
    this.name = 'StorageError'
    this.code = code
    this.params = params ?? (message ? { details: message } : undefined)
    setErrorCause(this, options?.cause)
  }
}

export const STORAGE_VALIDATION = {
  MAX_KEY_LENGTH: 1024,
  MAX_VALUE_SIZE: 50 * 1024 * 1024,
  RESERVED_KEYS: ['__db_metadata__', '__storage_metadata__'],
} as const

export function validateStorageKey(
  key: string,
  reservedKeys: string[] = STORAGE_VALIDATION.RESERVED_KEYS
): void {
  if (!key || typeof key !== 'string') {
    throw new StorageError('Key must be a non-empty string', 'validation')
  }
  if (key.length > STORAGE_VALIDATION.MAX_KEY_LENGTH) {
    throw new StorageError(
      `Key length exceeds maximum allowed size of ${STORAGE_VALIDATION.MAX_KEY_LENGTH}`,
      'validation'
    )
  }
  if (reservedKeys.includes(key)) {
    throw new StorageError(`Cannot use reserved key: ${key}`, 'validation')
  }
}

export function validateStorageValue(value: string): void {
  if (typeof value !== 'string') {
    throw new StorageError('Value must be a string', 'validation')
  }
  if (value.length > STORAGE_VALIDATION.MAX_VALUE_SIZE) {
    throw new StorageError(
      `Value size ${value.length} exceeds maximum allowed size of ${STORAGE_VALIDATION.MAX_VALUE_SIZE}`,
      'validation'
    )
  }
}
