import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['**/dist/**', '**/node_modules/**'],
    setupFiles: ['test/setup.ts'],
    silent: true,
    coverage: {
      provider: 'v8',
      exclude: [
        'src/index.ts',
        'src/auth/index.ts',
        'src/client/index.ts',
        'src/http/index.ts',
        'src/odata/index.ts',
        'src/types/index.ts',
        'src/utils/index.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 85,
      },
    },
  },
});
