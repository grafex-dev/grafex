import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // runtime.ts must be a separate entry so it's emitted as dist/runtime.js —
    // the transpile module uses esbuild's inject option to inject it into compositions
    entry: ['src/index.ts', 'src/runtime.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    target: 'node20',
  },
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    clean: false,
    target: 'node20',
  },
]);
