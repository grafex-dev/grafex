import { describe, test, expect, afterEach } from 'vitest';
import { transpile, resolveRuntimePath } from '../../src/transpile.js';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'node:fs';
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

  test('error message contains the esbuild error text', async () => {
    const tmpFile = join(tmpdir(), `grafex-test-invalid-${Date.now()}.tsx`);
    writeFileSync(tmpFile, 'const x: = 5;');
    try {
      await expect(transpile(tmpFile)).rejects.toThrow('Unexpected');
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

describe('transpile — CWD with node_modules', () => {
  let tmpDir: string;

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test('h() returns HtmlString (not plain object) when CWD has a tsconfig.json with jsxImportSource', async () => {
    tmpDir = join(tmpdir(), `grafex-test-cwd-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    // Simulate a project with react in node_modules and tsconfig.json that sets jsxImportSource
    mkdirSync(join(tmpDir, 'node_modules', 'react'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'node_modules', 'react', 'jsx-runtime.js'),
      'export function jsx(type, props) { return { type, props }; }\nexport function jsxs(type, props) { return { type, props }; }\nexport const Fragment = Symbol("Fragment");\n',
    );
    writeFileSync(
      join(tmpDir, 'node_modules', 'react', 'package.json'),
      JSON.stringify({
        name: 'react',
        version: '18.0.0',
        type: 'module',
        exports: { '.': './index.js', './jsx-runtime': './jsx-runtime.js' },
      }),
    );
    writeFileSync(
      join(tmpDir, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { jsx: 'react-jsx', jsxImportSource: 'react' } }),
    );

    const compositionPath = join(tmpDir, 'test.tsx');
    writeFileSync(
      compositionPath,
      'export const config = { width: 800, height: 400 };\nexport default function Test() { return <div>Hello</div>; }\n',
    );

    const code = await transpile(compositionPath);

    // The output must use h( not jsx( — meaning grafex's factory was used, not react's
    expect(code).toContain('h(');
    expect(code).not.toContain('jsx(');

    // Execute the transpiled code and verify the component returns an HtmlString, not a plain object
    const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${Date.now()}`;
    const mod = await import(dataUrl);
    const component = mod.default as () => unknown;
    const result = component();

    // If h() returned an HtmlString, String(result) gives HTML. If plain object, it gives [object Object].
    expect(String(result)).not.toBe('[object Object]');
    expect(String(result)).toContain('<div');
  });
});
