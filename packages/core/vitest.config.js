import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return {
    test: {
      // Avoid Windows OOM with forked workers on large suites
      pool: 'threads',
      globals: true,
      environment: 'node',
      setupFiles: ['./tests/setup.js'],
      // 设置测试超时时间
      testTimeout: 30000, // 默认30秒
      hookTimeout: 30000, // 钩子超时30秒
      // 环境变量配置
      env: {
        ...process.env,
      },
      // Exclude performance tests from regular runs
      exclude: ['**/tests/performance/**', '**/node_modules/**', '**/dist/**'],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Coverage thresholds to enforce
      lines: 70,
      functions: 65,
      branches: 60,
      statements: 70,
      // Per-file thresholds for core modules
      perFile: true,
      ignoreEmptyLines: true,
      thresholds: {
        lines: 70,
        functions: 65,
        branches: 60,
        statements: 70,
      },
    },
  }
})
