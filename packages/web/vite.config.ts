import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { compression } from 'vite-plugin-compression2'
import { resolve } from 'path'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 在 monorepo 中，脚本可能从不同的 cwd 启动；不要依赖 process.cwd() 去定位 .env。
  // 这里用配置文件所在位置推导出 monorepo root，并让 Vite 将 VITE_* 注入 import.meta.env。
  const monorepoRoot = resolve(__dirname, '../..')
  const env = loadEnv(mode, monorepoRoot)
  
  // Flexy loves modularity! Port is configurable via environment
  const port = parseInt(env.VITE_WEB_PORT || process.env.VITE_WEB_PORT || '18181', 10);
  
  return {
    envDir: monorepoRoot,
    plugins: [
      vue(),
      compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 1024,
        compressionOptions: {
          level: 9
        }
      }),
      compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 1024
      }),
      mode === 'analyze' && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
    ],
    server: {
      port: port,
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
      minify: 'terser',
      target: 'esnext',
      cssTarget: 'chrome80',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace', 'console.warn', 'console.error'],
          passes: 2,
          dead_code: true,
          unused: true,
        },
        mangle: {
          safari10: true,
          properties: {
            regex: /^_/
          }
        },
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        onwarn(warning, warn) {
          // Suppress dynamic import warnings - core is intentionally imported both ways
          if (warning.code === 'DYNAMIC_IMPORT_VARIABLE' || 
              (warning.message && warning.message.includes('dynamic import'))) {
            return;
          }
          warn(warning);
        },
        output: {
          manualChunks(id) {
            // Split vendor libraries into separate chunks
            if (id.includes('node_modules')) {
              // Vue ecosystem - core framework
              if (id.includes('vue/dist') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vendor-vue';
              }
              // UI Frameworks - naive-ui is large, split by component type
              if (id.includes('naive-ui')) {
                return 'vendor-ui-naive';
              }
              // Element Plus
              if (id.includes('element-plus') || id.includes('@element-plus')) {
                return 'vendor-ui-element';
              }
              // Icons - split from main UI bundle
              if (id.includes('@element-plus/icons') || id.includes('@vicons')) {
                return 'vendor-icons';
              }
              // CodeMirror - large editor library
              if (id.includes('@codemirror') || id.includes('codemirror')) {
                return 'vendor-codemirror';
              }
              // Markdown processing - large libraries
              if (id.includes('markdown-it') || id.includes('marked')) {
                return 'vendor-markdown';
              }
              // Syntax highlighting - very large
              if (id.includes('highlight.js') || id.includes('highlightjs') || id.includes('prismjs')) {
                return 'vendor-highlight';
              }
              // Utilities - small packages
              if (id.includes('lodash') || id.includes('dayjs') || id.includes('date-fns')) {
                return 'vendor-utils';
              }
              // DOM utilities
              if (id.includes('dompurify')) {
                return 'vendor-dom';
              }
              // Core package - our own code
              if (id.includes('@prompt-optimizer/core')) {
                return 'core';
              }
              // Other node_modules go to vendor chunk
              return 'vendor';
            }
            
            // Split UI package into smaller chunks for better caching
            if (id.includes('@prompt-optimizer/ui')) {
              // Workspace components - lazy loaded routes
              if (id.includes('Workspace')) {
                return 'ui-workspace';
              }
              // App layout components
              if (id.includes('app-layout') || id.includes('MainLayout')) {
                return 'ui-layout';
              }
              // Evaluation components
              if (id.includes('evaluation')) {
                return 'ui-evaluation';
              }
              // Context mode components
              if (id.includes('context-mode')) {
                return 'ui-context';
              }
              // Image mode components
              if (id.includes('image-mode')) {
                return 'ui-image';
              }
              // Tool and variable components
              if (id.includes('variable') || id.includes('tool')) {
                return 'ui-tools';
              }
              // Router - keep separate as it's used early
              if (id.includes('router')) {
                return 'ui-router';
              }
              // Plugins (i18n, pinia)
              if (id.includes('plugins')) {
                return 'ui-plugins';
              }
              // Other UI components
              return 'ui-components';
            }
          },
          // Ensure proper chunk loading with content hash for caching
          chunkFileNames: 'assets/[name]-[hash].js',
        }
      },
      chunkSizeWarningLimit: 3500, // Main chunk contains application logic, allow larger size
      sourcemap: false,
      // Suppress dynamic import warnings - core is intentionally imported both ways
      // Static imports for types/constants, dynamic for Electron-specific modules
      dynamicImportVarsOptions: {
        warnOnError: false,
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Ensure assets are properly hashed for caching
      assetsInlineLimit: 4096,
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
        }, {} as Record<string, string>)
      },
      // Fix vue-i18n devtools error in production
      '__INTLIFY_PROD_DEVTOOLS__': JSON.stringify(false),
      '__INTLIFY_DROP_MESSAGE_COMPILER__': JSON.stringify(false),
      '__VUE_I18N_FULL_INSTALL__': JSON.stringify(true),
      '__VUE_I18N_LEGACY_API__': JSON.stringify(false)
    }
  }
})
