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
 * Secure ID Generation Utilities
 * Uses crypto.randomUUID() for cryptographically secure, unpredictable identifiers
 */

/**
 * Generates a cryptographically secure UUID
 * Falls back to timestamp + counter if crypto.randomUUID is not available
 * @returns A unique identifier string
 */
export function generateSecureUUID(): string {
  const maybeCrypto = globalThis.crypto as unknown as { randomUUID?: () => string } | undefined
  if (maybeCrypto && typeof maybeCrypto.randomUUID === 'function') {
    return maybeCrypto.randomUUID()
  }
  return `fallback-${Date.now()}-${generateSecureUUID.counter++}`
}
generateSecureUUID.counter = 0

/**
 * Generates a secure ID with a custom prefix
 * @param prefix - The prefix for the ID (e.g., 'ctx', 'fav', 'cat')
 * @returns A unique identifier string with the given prefix
 */
export function generatePrefixedId(prefix: string): string {
  const uuid = generateSecureUUID()
  return `${prefix}-${uuid}`
}

/**
 * Generates a secure ID with timestamp prefix
 * Format: {prefix}_{timestamp}_{uuid_short}
 * @param prefix - The prefix for the ID
 * @returns A unique identifier string
 */
export function generateTimestampId(prefix: string): string {
  const uuid = generateSecureUUID()
  const shortUuid = uuid.replace(/-/g, '').slice(0, 9)
  return `${prefix}_${Date.now()}_${shortUuid}`
}
