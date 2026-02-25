/**
 * Type Helper Utilities for Better DX
 * Provides utility types that improve TypeScript inference and IDE autocompletion
 */

/**
 * Extract the value type from a const assertion object.
 * Useful for extracting error codes or configuration values.
 *
 * @example
 * ```typescript
 * const MY_CODES = { FOO: 'foo', BAR: 'bar' } as const
 * type MyCode = ValueOf<typeof MY_CODES> // 'foo' | 'bar'
 * ```
 */
export type ValueOf<T> = T extends infer U ? U[keyof U] : never

/**
 * Extract keys from an object type where the value matches a specific type.
 * Useful for filtering configuration keys.
 *
 * @example
 * ```typescript
 * type StringKeys = KeysOfValueType<{ a: string; b: number }, string> // 'a'
 * ```
 */
export type KeysOfValueType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * Make specific keys required while keeping others optional.
 * Useful for partial updates with required identifiers.
 *
 * @example
 * ```typescript
 * type UpdateWithId = RequireKeys<{ id?: string; name?: string }, 'id'>
 * // { id: string; name?: string }
 * ```
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Make specific keys optional while keeping others required.
 * Useful for creation types with optional defaults.
 *
 * @example
 * ```typescript
 * type CreateOptions = OptionalKeys<{ id: string; name: string }, 'id'>
 * // { id?: string; name: string }
 * ```
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Create a branded type for nominal typing.
 * Prevents accidental mixing of structurally identical types.
 *
 * @example
 * ```typescript
 * type UserId = Branded<string, 'UserId'>
 * type OrderId = Branded<string, 'OrderId'>
 * // These are now distinct types even though both are strings
 * ```
 */
export type Branded<T, B> = T & { readonly __brand: B }

/**
 * Extract the branded value type from a branded type.
 *
 * @example
 * ```typescript
 * type UserId = Branded<string, 'UserId'>
 * type RawId = Unbranded<UserId> // string
 * ```
 */
export type Unbranded<T> = T extends infer U & { readonly __brand: infer _ }
  ? U
  : T

/**
 * Create a branded value with type safety.
 * Throws a type error if used incorrectly.
 *
 * @example
 * ```typescript
 * type UserId = Branded<string, 'UserId'>
 * const userId = createBranded<string, 'UserId'>('user-123')
 * ```
 */
export function createBranded<T, B>(value: T): Branded<T, B> {
  return value as Branded<T, B>
}

/**
 * Deep partial type - makes all nested properties optional.
 * Useful for recursive configuration updates.
 *
 * @example
 * ```typescript
 * type DeepPartialConfig = DeepPartial<{ a: { b: string } }>
 * // { a?: { b?: string } }
 * ```
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/**
 * Deep required type - makes all nested properties required.
 * Useful for ensuring complete configuration objects.
 *
 * @example
 * ```typescript
 * type DeepRequiredConfig = DeepRequired<{ a?: { b?: string } }>
 * // { a: { b: string } }
 * ```
 */
export type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T

/**
 * Deep readonly type - makes all nested properties readonly.
 * Useful for immutable configuration objects.
 *
 * @example
 * ```typescript
 * type ImmutableConfig = DeepReadonly<{ a: { b: string[] } }>
 * // { readonly a: { readonly b: readonly string[] } }
 * ```
 */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T

/**
 * Extract function parameter types as a tuple.
 * Useful for extracting parameter types from existing functions.
 *
 * @example
 * ```typescript
 * function foo(a: string, b: number): void {}
 * type FooParams = Parameters<typeof foo> // [string, number]
 * ```
 */
export type FunctionParameters<T extends (...args: any[]) => any> =
  T extends (...args: infer P) => any ? P : never

/**
 * Extract function return type.
 * Useful for extracting return types from existing functions.
 *
 * @example
 * ```typescript
 * function foo(): string { return 'bar' }
 * type FooReturn = FunctionReturnType<typeof foo> // string
 * ```
 */
export type FunctionReturnType<T extends (...args: any[]) => any> =
  T extends (...args: any[]) => infer R ? R : never

/**
 * Type-safe Object.keys that returns typed keys.
 * Useful for iterating over object keys with proper typing.
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2 } as const
 * const keys = objectKeys(obj) // ('a' | 'b')[]
 * ```
 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * Type-safe Object.entries that returns typed entries.
 * Useful for iterating over object entries with proper typing.
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2 } as const
 * const entries = objectEntries(obj) // (['a', 1] | ['b', 2])[]
 * ```
 */
export function objectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * Type-safe Object.fromEntries with proper typing.
 * Useful for creating typed objects from entries.
 *
 * @example
 * ```typescript
 * const entries = [['a', 1], ['b', 2]] as const
 * const obj = fromEntries(entries) // { a: 1; b: 2 }
 * ```
 */
export function fromEntries<K extends PropertyKey, V>(
  entries: readonly (readonly [K, V])[]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}

/**
 * Pick properties from an object by keys with type safety.
 * Useful for extracting subsets of configuration objects.
 *
 * @example
 * ```typescript
 * const config = { a: 1, b: 2, c: 3 }
 * const subset = pick(config, ['a', 'b']) // { a: 1; b: 2 }
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * Omit properties from an object by keys with type safety.
 * Useful for removing sensitive or unnecessary properties.
 *
 * @example
 * ```typescript
 * const config = { a: 1, b: 2, c: 3 }
 * const subset = omit(config, ['c']) // { a: 1; b: 2 }
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result as Omit<T, K>
}

/**
 * Check if a value is not null or undefined.
 * Useful for filtering arrays while maintaining type safety.
 *
 * @example
 * ```typescript
 * const items = [1, null, 2, undefined, 3]
 * const filtered = items.filter(isDefined) // number[]
 * ```
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Check if a value is a number (not NaN or Infinity).
 * Useful for validating numeric inputs.
 *
 * @example
 * ```typescript
 * if (isNumber(value)) {
 *   // value is number and not NaN/Infinity
 * }
 * ```
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Check if a value is an integer.
 * Useful for validating counts, indices, and other integer values.
 *
 * @example
 * ```typescript
 * if (isInteger(value)) {
 *   // value is integer
 * }
 * ```
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

/**
 * Check if a value is a positive number (> 0).
 * Useful for validating quantities, prices, etc.
 *
 * @example
 * ```typescript
 * if (isPositiveNumber(value)) {
 *   // value is positive
 * }
 * ```
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0
}

/**
 * Check if a value is a non-negative number (>= 0).
 * Useful for validating counts, percentages, etc.
 *
 * @example
 * ```typescript
 * if (isNonNegativeNumber(value)) {
 *   // value is >= 0
 * }
 * ```
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0
}

/**
 * Check if a value is a non-empty string.
 * Useful for validating required string inputs.
 *
 * @example
 * ```typescript
 * if (isNonEmptyString(value)) {
 *   // value is string and not empty
 * }
 * ```
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Check if a value is a plain object (not null, not array).
 * Useful for validating configuration objects.
 *
 * @example
 * ```typescript
 * if (isPlainObject(value)) {
 *   // value is Record<string, unknown>
 * }
 * ```
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Assert a condition and throw an error if false.
 * Useful for runtime type assertions with helpful error messages.
 *
 * @example
 * ```typescript
 * function processConfig(config: unknown) {
 *   assert(isPlainObject(config), 'Config must be an object')
 *   // config is now typed as Record<string, unknown>
 * }
 * ```
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}
