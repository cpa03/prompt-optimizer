/**
 * Model Parameter Limits
 * Centralizes all model-specific parameter limits and constraints
 * Flexy loves modularity! No more magic numbers scattered across adapters.
 */

import { getEnvInt } from '../config/env'

/**
 * Token generation limits
 * Maximum tokens that can be generated in a single request
 */
export const MODEL_TOKEN_LIMITS = {
  /** OpenAI maximum completion tokens (1M tokens) */
  OPENAI_MAX: getEnvInt('MODEL_TOKEN_LIMIT_OPENAI_MAX', 1_000_000),
  /** Gemini maximum output tokens */
  GEMINI_MAX: getEnvInt('MODEL_TOKEN_LIMIT_GEMINI_MAX', 8192),
  /** DashScope/Qwen maximum tokens */
  DASHSCOPE_MAX: getEnvInt('MODEL_TOKEN_LIMIT_DASHSCOPE_MAX', 16384),
  /** Default maximum tokens when provider-specific limit is unknown */
  DEFAULT_MAX: getEnvInt('MODEL_TOKEN_LIMIT_DEFAULT_MAX', 1_000_000),
} as const

/**
 * Model context length limits
 * Maximum context window size for different models
 */
export const MODEL_MAX_CONTEXT = {
  /** GPT-4/GPT-5 latest models with ~1M context */
  GPT_LATEST: getEnvInt('MODEL_MAX_CONTEXT_GPT_LATEST', 1_047_576),
  /** Gemini 1M token context window */
  GEMINI_1M: getEnvInt('MODEL_MAX_CONTEXT_GEMINI_1M', 1_000_000),
  /** Claude 128K context window */
  CLAUDE: getEnvInt('MODEL_MAX_CONTEXT_CLAUDE', 128_000),
  /** Qwen standard context (128K) */
  QWEN_STANDARD: getEnvInt('MODEL_MAX_CONTEXT_QWEN_STANDARD', 131_072),
  /** Qwen turbo with 1M context */
  QWEN_TURBO: getEnvInt('MODEL_MAX_CONTEXT_QWEN_TURBO', 1_000_000),
  /** Default context length when unknown */
  DEFAULT: getEnvInt('MODEL_MAX_CONTEXT_DEFAULT', 8192),
} as const

/**
 * Random seed parameter limits
 * Used for deterministic sampling
 */
export const MODEL_SEED_LIMITS = {
  /** Maximum seed value (2^31 - 1, 32-bit signed integer max) */
  MAX: getEnvInt('MODEL_SEED_MAX', 2_147_483_647),
  /** Minimum seed value */
  MIN: getEnvInt('MODEL_SEED_MIN', 0),
} as const

/**
 * Thinking/reasoning budget limits
 * Used for models that support extended reasoning
 */
export const MODEL_THINKING_BUDGET_LIMITS = {
  /** DashScope maximum thinking budget */
  DASHSCOPE_MAX: getEnvInt('MODEL_THINKING_BUDGET_DASHSCOPE_MAX', 20_000),
  /** Gemini maximum thinking budget */
  GEMINI_MAX: getEnvInt('MODEL_THINKING_BUDGET_GEMINI_MAX', 8192),
  /** Thinking budget step increment */
  STEP: getEnvInt('MODEL_THINKING_BUDGET_STEP', 100),
} as const

/**
 * Timeout parameter limits for LLM requests
 */
export const MODEL_TIMEOUT_LIMITS = {
  /** Default timeout in milliseconds */
  DEFAULT_MS: getEnvInt('MODEL_TIMEOUT_DEFAULT_MS', 60_000),
  /** Minimum timeout in milliseconds */
  MIN_MS: getEnvInt('MODEL_TIMEOUT_MIN_MS', 1_000),
  /** Maximum timeout in milliseconds (10 minutes) */
  MAX_MS: getEnvInt('MODEL_TIMEOUT_MAX_MS', 600_000),
} as const

/**
 * Sampling parameter limits
 */
export const MODEL_SAMPLING_LIMITS = {
  /** Temperature range */
  TEMPERATURE: {
    MIN: 0,
    MAX: 2,
    STEP: 0.1,
    DEFAULT: 1,
  },
  /** Top-p (nucleus sampling) range */
  TOP_P: {
    MIN: 0,
    MAX: 1,
    STEP: 0.01,
    DEFAULT: 1,
  },
  /** Presence/frequency penalty range */
  PENALTY: {
    MIN: -2,
    MAX: 2,
    STEP: 0.1,
    DEFAULT: 0,
  },
  /** Top-k sampling range */
  TOP_K: {
    MIN: 1,
    MAX: 100,
    STEP: 1,
    DEFAULT: 1,
  },
} as const

/**
 * Log probabilities limits
 */
export const MODEL_LOGPROBS_LIMITS = {
  /** Maximum number of top log probabilities to return */
  TOP_LOGPROBS_MAX: getEnvInt('MODEL_TOP_LOGPROBS_MAX', 20),
} as const

/**
 * Completion count limits
 */
export const MODEL_COMPLETION_LIMITS = {
  /** Maximum number of completions (n parameter) */
  N_MAX: getEnvInt('MODEL_N_MAX', 10),
  N_MIN: getEnvInt('MODEL_N_MIN', 1),
} as const

/**
 * Aggregate export for all model limits
 */
export const MODEL_LIMITS = {
  TOKENS: MODEL_TOKEN_LIMITS,
  CONTEXT: MODEL_MAX_CONTEXT,
  SEED: MODEL_SEED_LIMITS,
  THINKING_BUDGET: MODEL_THINKING_BUDGET_LIMITS,
  TIMEOUT: MODEL_TIMEOUT_LIMITS,
  SAMPLING: MODEL_SAMPLING_LIMITS,
  LOGPROBS: MODEL_LOGPROBS_LIMITS,
  COMPLETION: MODEL_COMPLETION_LIMITS,
} as const
