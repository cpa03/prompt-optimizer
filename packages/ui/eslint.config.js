import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import vuePlugin from 'eslint-plugin-vue';

export default [
  {
    ignores: ['dist/', 'node_modules/', '*.js', '*.cjs', '*.mjs']
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node
      }
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tseslint
    },
    rules: {
      ...vuePlugin.configs['vue3-recommended'].rules,
      'vue/attributes-order': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-unused-components': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off',
      'no-duplicate-imports': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off',
      'no-duplicate-imports': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': 'off'
    }
  }
];
