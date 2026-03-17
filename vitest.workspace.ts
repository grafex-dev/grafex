import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      environment: 'node',
      include: ['test/unit/**/*.test.ts'],
      testTimeout: 30_000,
    },
  },
  {
    test: {
      name: 'integration',
      environment: 'node',
      include: ['test/integration/**/*.test.ts'],
      pool: 'forks',
      testTimeout: 60_000,
    },
  },
]);
