import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Many tests await a real 500ms fake-latency sleep() in the component
    // under test (matching the app's onSubmit convention). Under this
    // sandbox's default worker concurrency, that's enough CPU contention
    // across ~85 files to blow the 5s default timeout intermittently even
    // though each test is fast in isolation — cap workers instead of just
    // raising the timeout, since the goal is fewer concurrent sleeps, not
    // more patience for a resource-starved run.
    testTimeout: 10000,
    maxWorkers: 4,
  },
})
