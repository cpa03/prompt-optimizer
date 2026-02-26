/*
 * Prompt Optimizer - AI提示词优化工具
 * Copyright (C) 2025 linshenkx
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Secure ID generation utilities
 * Uses crypto.getRandomValues() for cryptographically secure random values
 */

/**
 * Generate a cryptographically secure random string
 * @param length - Number of random characters to generate (default: 9)
 * @returns Random string using lowercase letters and numbers
 */
export function generateSecureRandomString(length: number = 9): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

/**
 * Generate a secure unique ID with optional prefix and timestamp
 * @param options - Configuration options
 * @param options.prefix - Optional prefix for the ID
 * @param options.includeTimestamp - Whether to include timestamp (default: true)
 * @param options.randomLength - Length of random portion (default: 9)
 * @param options.useBase36Timestamp - Whether to use base36 encoding for timestamp (default: false for compatibility)
 * @returns Secure unique ID
 */
export function generateSecureId(options?: {
  prefix?: string
  includeTimestamp?: boolean
  randomLength?: number
  useBase36Timestamp?: boolean
}): string {
  const prefix = options?.prefix ?? ''
  const includeTimestamp = options?.includeTimestamp ?? true
  const randomLength = options?.randomLength ?? 9
  const useBase36Timestamp = options?.useBase36Timestamp ?? false

  const parts: string[] = []
  if (prefix) {
    parts.push(prefix)
  }
  if (includeTimestamp) {
    const timestamp = useBase36Timestamp ? Date.now().toString(36) : Date.now().toString()
    parts.push(timestamp)
  }
  parts.push(generateSecureRandomString(randomLength))

  return parts.join('-')
}
