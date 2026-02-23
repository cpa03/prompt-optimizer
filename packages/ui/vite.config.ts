import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    // Monorepo: load VITE_* from repo root .env(.local) so optional integrations
    // can be enabled for the built UI bundle used by the web dev server.
    envDir: resolve(__dirname, '../..'),
    plugins: [vue()],
    resolve: {
      alias: {
        '@ui': path.resolve(__dirname, '../ui'),
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'PromptOptimizerUI',
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        formats: ['es', 'cjs'],
      },
      watch: !isProduction
        ? {
            // 更精确的监听配置
            include: ['src/**/*'],
            buildDelay: 100,
          }
        : null,
      sourcemap: !isProduction,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        },
      },
      rollupOptions: {
        external: [
          'vue',
          'vue-router',
          '@prompt-optimizer/core',
          'uuid',
          'naive-ui',
          /naive-ui\/.*/,
        ],
        output: {
          globals: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            '@prompt-optimizer/core': 'PromptOptimizerCore',
            uuid: 'uuid',
          },
          assetFileNames: 'style.css',
          // Preserve modules for better tree-shaking
          preserveModules: false,
          inlineDynamicImports: false,
        },
      },
      cssCodeSplit: false,
      emptyOutDir: false,
    },
    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg'],
  }
})
