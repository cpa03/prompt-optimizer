import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 在 monorepo 中，脚本可能从不同的 cwd 启动；不要依赖 process.cwd() 去定位 .env。
  // 这里用配置文件所在位置推导出 monorepo root，并让 Vite 将 VITE_* 注入 import.meta.env。
  const monorepoRoot = resolve(__dirname, '../..')
  const env = loadEnv(mode, monorepoRoot)
  
  return {
    envDir: monorepoRoot,
    plugins: [vue()],
    server: {
      port: 18181,
      host: true,
      fs: {
        // 允许为工作区依赖提供服务
        allow: ['..']
      },
      hmr: true,
      watch: {
        // 确保监视monorepo中其他包的变化
        ignored: ['!**/node_modules/@prompt-optimizer/**']
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks(id) {
            // Split vendor libraries into separate chunks
            if (id.includes('node_modules')) {
              // Vue ecosystem
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vendor-vue';
              }
              // UI Frameworks - naive-ui is large
              if (id.includes('naive-ui') || id.includes('element-plus') || id.includes('@element-plus')) {
                return 'vendor-ui';
              }
              // Icons
              if (id.includes('@element-plus/icons') || id.includes('@vicons')) {
                return 'vendor-icons';
              }
              // Utilities
              if (id.includes('lodash') || id.includes('dayjs') || id.includes('date-fns')) {
                return 'vendor-utils';
              }
              // Markdown and syntax highlighting
              if (id.includes('markdown') || id.includes('highlight') || id.includes('prism')) {
                return 'vendor-markdown';
              }
              // Core package
              if (id.includes('@prompt-optimizer/core')) {
                return 'core';
              }
              // Other node_modules go to vendor chunk
              return 'vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false
    },
    publicDir: 'public',
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': resolve(__dirname, 'src'),
        '@prompt-optimizer/core': path.resolve(__dirname, '../core'),
        '@prompt-optimizer/ui': path.resolve(__dirname, '../ui'),
        '@prompt-optimizer/web': path.resolve(__dirname, '../web'),
        '@prompt-optimizer/extension': path.resolve(__dirname, '../extension')
      }
    },
    optimizeDeps: {
      // 预构建依赖
      include: ['element-plus'],
    },
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        ...Object.keys(env).reduce((acc, key) => {
          acc[key] = env[key];
          return acc;
        }, {})
      }
    }
  }
})
