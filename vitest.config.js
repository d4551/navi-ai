import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        'scripts/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80,
        },
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 2,
        maxThreads: 4,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Test file patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/test/e2e/**', // Exclude E2E tests from unit test runs
    ],
    // Mock configuration
    deps: {
      external: ['better-sqlite3', 'electron'],
      inline: ['@vue/test-utils'],
    },
    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      VITE_API_MOCK: 'true',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      // Test-specific aliases
      '@tests': fileURLToPath(new URL('./test', import.meta.url)),
      '@testHelpers': fileURLToPath(
        new URL('./src/utils/testing', import.meta.url)
      ),
    },
  },
  define: {
    // Define test environment variables
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __TEST__: true,
  },
})
