/**
 * JSON utilities for parsing LLM responses
 *
 * LLM responses often contain malformed JSON or JSON wrapped in markdown code blocks.
 * These utilities provide robust parsing for AI agent workflows.
 */

import { jsonrepair } from 'jsonrepair'

/**
 * Result of parsing JSON from LLM response
 */
export interface LLMJsonParseResult<T = unknown> {
  /** Whether parsing was successful */
  success: boolean
  /** Parsed data (only when success is true) */
  data?: T
  /** Error message (only when success is false) */
  error?: string
  /** Whether jsonrepair was used to fix the JSON */
  repaired: boolean
  /** Whether a markdown code block was extracted */
  extractedFromMarkdown: boolean
}

/**
 * Options for parsing JSON from LLM responses
 */
export interface LLMJsonParseOptions {
  /** Whether to attempt jsonrepair on parse failures (default: true) */
  useRepair?: boolean
  /** Whether to extract JSON from markdown code blocks (default: true) */
  extractMarkdown?: boolean
  /** Custom fallback message for errors */
  fallbackMessage?: string
}

/**
 * Extracts JSON content from markdown code blocks
 *
 * @param content - Raw content potentially containing markdown
 * @returns Object with extracted JSON text and flag indicating if extraction occurred
 *
 * @example
 * ```typescript
 * const result = extractJsonFromMarkdown('```json\n{"key": "value"}\n```')
 * // result = { jsonText: '{"key": "value"}', extracted: true }
 * ```
 */
export function extractJsonFromMarkdown(content: string): {
  jsonText: string
  extracted: boolean
} {
  // Try JSON code block first
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/i)
  if (jsonBlockMatch) {
    return { jsonText: jsonBlockMatch[1], extracted: true }
  }

  // Try generic code block
  const genericBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/)
  if (genericBlockMatch) {
    const blockContent = genericBlockMatch[1].trim()
    // Check if it looks like JSON (starts with { or [)
    if (blockContent.startsWith('{') || blockContent.startsWith('[')) {
      return { jsonText: blockContent, extracted: true }
    }
  }

  return { jsonText: content, extracted: false }
}

/**
 * Safely parses JSON from LLM response with automatic repair fallback
 *
 * @param content - Raw content from LLM (may contain markdown or malformed JSON)
 * @param options - Parse options
 * @returns Parse result with metadata about the parsing process
 *
 * @example
 * ```typescript
 * const result = parseLLMJson<{name: string}>('```json\n{"name": "test"}\n```')
 * if (result.success) {
 *   console.log(result.data.name) // "test"
 * }
 * ```
 */
export function parseLLMJson<T = unknown>(
  content: string,
  options: LLMJsonParseOptions = {}
): LLMJsonParseResult<T> {
  const { useRepair = true, extractMarkdown = true } = options

  let jsonText = content
  let extractedFromMarkdown = false

  // Extract from markdown if enabled
  if (extractMarkdown) {
    const extraction = extractJsonFromMarkdown(content)
    jsonText = extraction.jsonText
    extractedFromMarkdown = extraction.extracted
  }

  // Try direct parse first
  try {
    const data = JSON.parse(jsonText) as T
    return {
      success: true,
      data,
      repaired: false,
      extractedFromMarkdown,
    }
  } catch (directError) {
    // If repair is disabled, return failure
    if (!useRepair) {
      return {
        success: false,
        error: directError instanceof Error ? directError.message : String(directError),
        repaired: false,
        extractedFromMarkdown,
      }
    }

    // Try with jsonrepair
    try {
      const repaired = jsonrepair(jsonText)
      const data = JSON.parse(repaired) as T
      return {
        success: true,
        data,
        repaired: true,
        extractedFromMarkdown,
      }
    } catch (repairError) {
      return {
        success: false,
        error: repairError instanceof Error ? repairError.message : String(repairError),
        repaired: true,
        extractedFromMarkdown,
      }
    }
  }
}

/**
 * Parses JSON from LLM response, throwing on failure
 *
 * @param content - Raw content from LLM
 * @param options - Parse options
 * @returns Parsed JSON data
 * @throws Error if parsing fails
 *
 * @example
 * ```typescript
 * try {
 *   const data = parseLLMJsonOrThrow<{name: string}>(llmResponse)
 *   console.log(data.name)
 * } catch (error) {
 *   console.error('Failed to parse LLM response:', error)
 * }
 * ```
 */
export function parseLLMJsonOrThrow<T = unknown>(
  content: string,
  options: LLMJsonParseOptions = {}
): T {
  const result = parseLLMJson<T>(content, options)

  if (!result.success) {
    const message = options.fallbackMessage || 'Failed to parse JSON from LLM response'
    throw new Error(`${message}: ${result.error}`)
  }

  return result.data as T
}

/**
 * Type guard to check if a value is a valid JSON object (not array, not primitive)
 *
 * @param value - Value to check
 * @returns True if value is a non-array, non-null object
 */
export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard to check if a value is a valid JSON array
 *
 * @param value - Value to check
 * @returns True if value is an array
 */
export function isJsonArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}
