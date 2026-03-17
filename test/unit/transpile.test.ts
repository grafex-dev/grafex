import { describe, test, expect } from 'vitest';
import { transpile, resolveRuntimePath } from '../../src/transpile.js';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

describe('transpile — basic output', () => {
  test('transpiling simple.tsx returns a non-empty string', async () => {
    const output = await transpile(resolve(fixturesDir, 'simple.tsx'));
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });

  test('output contains h( calls (JSX factory injection)', async () => {
    const output = await transpile(resolve(fixturesDir, 'simple.tsx'));
    expect(output).toContain('h(');
  });

  test('output contains no raw JSX syntax (no angle-bracket elements)', async () => {
    const output = await transpile(resolve(fixturesDir, 'simple.tsx'));
    // JSX elements like <div or <h1 should not appear in transpiled output
    expect(output).not.toMatch(/<[a-zA-Z][a-zA-Z0-9]*/);
  });

  test('output is valid ESM (contains export)', async () => {
    const output = await transpile(resolve(fixturesDir, 'simple.tsx'));
    expect(output).toMatch(/export/);
  });
});

describe('transpile — fixture files', () => {
  test('transpiling with-props.tsx returns a non-empty string without throwing', async () => {
    const output = await transpile(resolve(fixturesDir, 'with-props.tsx'));
    expect(output.length).toBeGreaterThan(0);
  });

  test('transpiling with-components.tsx returns a non-empty string without throwing', async () => {
    const output = await transpile(resolve(fixturesDir, 'with-components.tsx'));
    expect(output.length).toBeGreaterThan(0);
  });
});

describe('transpile — error propagation', () => {
  test('throws an Error with esbuild message when composition has a syntax error', async () => {
    const tmpFile = join(tmpdir(), `grafex-test-invalid-${Date.now()}.tsx`);
    writeFileSync(tmpFile, 'export default function Bad() { return <div INVALID SYNTAX !!! }');
    try {
      await expect(transpile(tmpFile)).rejects.toThrow(Error);
    } finally {
      unlinkSync(tmpFile);
    }
  });

  test('error message includes esbuild error text', async () => {
    const tmpFile = join(tmpdir(), `grafex-test-invalid-${Date.now()}.tsx`);
    writeFileSync(tmpFile, 'const x: = 5;');
    try {
      await expect(transpile(tmpFile)).rejects.toThrow(/esbuild|error|Expected|Unexpected/i);
    } finally {
      unlinkSync(tmpFile);
    }
  });

  test('error message contains custom prefix "esbuild transpilation failed:"', async () => {
    const tmpFile = join(tmpdir(), `grafex-test-invalid-${Date.now()}.tsx`);
    writeFileSync(tmpFile, 'const x: = 5;');
    try {
      await expect(transpile(tmpFile)).rejects.toThrow('esbuild transpilation failed:');
    } finally {
      unlinkSync(tmpFile);
    }
  });
});

describe('transpile — resolveRuntimePath missing runtime', () => {
  test('throws when neither runtime.js nor runtime.ts exists at the given dir', () => {
    expect(() => resolveRuntimePath('/tmp/no-such-dir-grafex-test')).toThrow(
      'Grafex runtime not found',
    );
  });

  test('error message includes the expected directory path', () => {
    const dir = '/tmp/no-such-dir-grafex-test';
    expect(() => resolveRuntimePath(dir)).toThrow(dir);
  });
});

describe('transpile — module exports', () => {
  test('transpile is a named export', async () => {
    const mod = await import('../../src/transpile.js');
    expect(typeof mod.transpile).toBe('function');
  });

  test('named exports are transpile and resolveRuntimePath', async () => {
    const mod = await import('../../src/transpile.js');
    const exports = Object.keys(mod).sort();
    expect(exports).toEqual(['resolveRuntimePath', 'transpile']);
  });
});
