/**
 * Test Data Configuration Module
 * Centralizes all test data, mock values, and test constants
 * Flexy loves modularity! No more hardcoded test data scattered across files.
 */

import { MIME_TYPES } from './http';

// Test image base64 (1x1 transparent PNG)
const TEST_IMAGE_BASE64_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Test image data URLs
export const TEST_IMAGES = {
  // Minimal 1x1 transparent PNG for testing
  TRANSPARENT_PNG: `data:${MIME_TYPES.PNG};base64,${TEST_IMAGE_BASE64_DATA}`,
  
  // Legacy test image (larger, for backwards compatibility)
  LEGACY_PNG: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAABGVJREFUeJztm01oXFUUx3/vzZtJMmnapPWjraZN/SCNrS200KKgIGhBXYhQcOHChYJbwY3gQnDhwoWgi4ILQRFciCCCC1sQwYKLii1YC1ppbWsb29Sm+Zg0mWTevHfvcefOm8nMm5lk3ryZvPwgvHvfO+fcO//cc8+79wZCQkJCQkJCQrZJAC5wC3gd+B54HfgCuO7ad4C/KsuLtR3E6gFvAH1AAiwDPwBLwBzwmXveaH4H8ASwF7yfawNYBL4Cfq7VPrMF3AVcB/qATdJ6x8CXwNEa+x6qY8BDwG/AADAKzAJZYMLN7zMfnCYA4G3gJDAJzAO9wPfAEPCKG7vE6sYAfAK8BOwDFoC7gVHgWWARsL0VX6wGYANYBnYCu4BjQMIVKyfdcxH4FrgJfOiOHnAM+BWwgZNAGhjw4rZZM4BF4BzwJ3DCjUWkqaXABeAi8CKQAl4DFoATwB1uxd8wCxQZ0XPBYuAJoO3DfOOZjhvAOeB5V6SdABYZWKkNwAbwDLAKnDZP7Qa+Av4Gzo/xH7IbuOJe+yTwByvBr+3VwxrrQKvkL+Bf4LE2VsU8cBGYIIKfuxRFJiYJAL9nE8zf/M2zW/Ll7zqgBBxoY1XMAmNE8HOXothNJiYJAL9hE9wdGF4IcVlmNPqfk4QsXFkCQu3fBrAjQNVsChFJ6CeS4CaZJqAnQNVsChFZeECCm0y9N0AAGElwk1lTSewNUDWbQkQS3GQaeIsAngBUsyn0E0lwk1lN6NeB3jZWxZOElIQHUC8J/UQS3GRqQh8E2hnfVBL7Atb9phGRhAckuMnUhD4A/N3GqlCShJ5NMMGJJLjJ1AT3AXOEVJS7Qcrb2zhGJMFNpiZ0P/APcG+AqtkUIpLgJlMT2gfs3SaP5N8EEnwP8Kf7gGFgO8x0xyUhK+Dre4K6o82g0o4h2zDTbVpHyMrLanxT9AV9a9VpQWgJV1HKBq4CqeKG6KbL9bbN3OVqw7q1W8gMlLOHh40TzE0hKwqjbO6qFJO5sn+OE9u0JnQGJiXJ1mKdR/gSF5Z9E0ywFaHbXGDEg4j8WjSC7hJyIcmP0SjMCWElwW0MEUH0s4k4zWuIyGKFmGDl5aBGdI/9/8mABDeZmtB7gV4iekKT2BNwD7DfYx4+W5JZd1fI0xDKq+qJakTi0xRzMKTGsR7eI+J9gptMTWg/+Ku6tSXhEt7hCTfgJXjX6wa8hBfwxVPgaLW8hNeUbDK7hVxuLcLVF0zSh3R+Q/hsKIr2+zZLT8jnJOQ7wn5H2O8I+x1hvyPsd4T9jrDfEfY7wn5H2O8I+x1hvyPsd4T9jrDfEfY7wn5H2O8I+x1hvyPsd4T9jrDfEfY7wn5H2O8I+x1hfZKwvyVd10ukBOvMNeAj4B9gAnh3+wfbEy9TZx+c7R+Ay3Q2v1ek3gJOufblO7/YnphrCfn8Yr0F7HOfgG35j5tOpK4+GWfA6y4y5ePa8t0v4wyY8pq/Am9tQ10hISEhISEhIaFo/gOE5C7Cek1g0wAAAABJRU5ErkJggg==',
} as const;

// Test identifiers for test suites
export const TEST_IDS = {
  IMPORT_TEST_001: 'import-test-001',
  IMPORT_TEST_002: 'import-test-002',
  IMPORT_CAT_001: 'import-cat-001',
  IMPORT_CATEGORY_001: 'import-category-001',
  DUPLICATE_TEST_001: 'duplicate-test-001',
} as const;

// Test messages for chain testing
export const TEST_MESSAGE_IDS = {
  MSG_123: 'msg-123',
  MSG_456: 'msg-456',
  MSG_789: 'msg-789',
  MSG_NEW_1: 'msg-new-1',
  MSG_NEW_2: 'msg-new-2',
  MSG_OLD_1: 'msg-old-1',
  MSG_OLD_2: 'msg-old-2',
} as const;

export const TEST_CHAIN_IDS = {
  CHAIN_ABC: 'chain-abc',
  CHAIN_DEF: 'chain-def',
  CHAIN_GHI: 'chain-ghi',
  CHAIN_JKL: 'chain-jkl',
  CHAIN_NEW_1: 'chain-new-1',
  CHAIN_NEW_2: 'chain-new-2',
  CHAIN_OLD_1: 'chain-old-1',
  CHAIN_OLD_2: 'chain-old-2',
} as const;

// Test variables
export const TEST_VARIABLES = {
  GLOBAL_USER_NAME: 'user-name',
  GLOBAL_USER_VALUE: 'John',
  USER_ID: 'user_id',
  USER_ID_VALUE: '123',
  VAR1: 'var1',
  VAR1_VALUE: 'value1',
} as const;

// Garden test configuration
export const GARDEN_TEST_CONFIG = {
  BASE_URL: 'http://garden.local',
  API_BASE_PATH: '/api/prompt-source/',
  NOTEBOOKS: {
    BASIC: 'NB-001',
    PRO: 'NB-PRO-001',
    PRO_VARIABLE: 'NB-PVAR-001',
    IMAGE_TEXT2IMAGE: 'NB-I2I-001',
  },
} as const;

// Timeout values for tests (in milliseconds)
export const TEST_TIMEOUTS = {
  QUICK: 200,
  SHORT: 300,
  MEDIUM: 500,
  LONG: 1000,
  VERY_LONG: 2000,
  POLL_TIMEOUT: 20000,
} as const;

// Export format types
export const EXPORT_FORMATS = {
  STANDARD: 'standard-prompt',
  OPENAI: 'openai-request',
  TEMPLATE: 'prompt-template',
} as const;

// Test content types
export const TEST_CONTENT_TYPES = {
  JSON: 'application/json',
  PNG: 'image/png',
} as const;
