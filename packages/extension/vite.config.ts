import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@prompt-optimizer/ui': resolve(__dirname, '../ui')
    },
  },
  base: './',  // 使用相对路径
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
      mangle: {
        safari10: true,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html')
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
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'background.js') {
            return 'background.js';
          }
          return `assets/[name].[ext]`;
        },
        manualChunks(id) {
          // Split vendor libraries into separate chunks to reduce main bundle size
          if (id.includes('node_modules')) {
            // Vue ecosystem - core framework
            if (id.includes('vue/dist') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor-vue';
            }
            // UI Frameworks
            if (id.includes('naive-ui')) {
              return 'vendor-ui-naive';
            }
            // Element Plus
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'vendor-ui-element';
            }
            // Icons
            if (id.includes('@element-plus/icons') || id.includes('@vicons')) {
              return 'vendor-icons';
            }
            // CodeMirror - large editor library
            if (id.includes('@codemirror') || id.includes('codemirror')) {
              return 'vendor-codemirror';
            }
            // Utilities - small packages
            if (id.includes('lodash') || id.includes('dayjs') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            // Core package - our own code
            if (id.includes('@prompt-optimizer/core')) {
              return 'core';
            }
            // Other node_modules go to vendor chunk
            return 'vendor';
          }
          
          // Split UI package components
          if (id.includes('@prompt-optimizer/ui')) {
            // Workspace components
            if (id.includes('Workspace')) {
              return 'ui-workspace';
            }
            // Other UI components
            return 'ui-components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 3500, // Extension popup.js contains full app logic, allow larger chunks
    // Suppress dynamic import warnings - core is intentionally imported both ways
    // Static imports for types/constants, dynamic for Electron-specific modules
    dynamicImportVarsOptions: {
      warnOnError: false,
    },
    copyPublicDir: true
  },
  server: {
    port: 5174,
    https: {}
  }
}) 