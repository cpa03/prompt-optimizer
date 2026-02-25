/**
 * Date utility functions
 * Centralizes date formatting across the application
 */
import { CALCULATION_CONSTANTS } from '../config/constants'

const { MS_PER_MINUTE, MS_PER_HOUR, MS_PER_DAY } = CALCULATION_CONSTANTS

/**
 * Format a timestamp to a localized date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

/**
 * Format a timestamp to a localized date string (short format)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (date only)
 */
export function formatDateShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Format a timestamp to a localized time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

/**
 * Format a timestamp to relative time (e.g., "刚刚", "5分钟前", "昨天")
 * Chinese-specific relative time formatting
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string in Chinese
 */
export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / MS_PER_DAY)

  if (days === 0) {
    const hours = Math.floor(diff / MS_PER_HOUR)
    if (hours === 0) {
      const minutes = Math.floor(diff / MS_PER_MINUTE)
      return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}
