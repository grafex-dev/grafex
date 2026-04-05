import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const cliPath = resolve(rootDir, 'src/cli.ts');

function runCli(args: string[], cwd: string) {
  return spawnSync('npx', ['tsx', cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 30000,
  });
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'grafex-init-test-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('grafex init — file creation', () => {
  test('creates tsconfig.json and composition.tsx in cwd, exits 0', () => {
    const result = runCli(['init'], tmpDir);
    expect(result.status).toBe(0);
    expect(existsSync(resolve(tmpDir, 'tsconfig.json'))).toBe(true);
    expect(existsSync(resolve(tmpDir, 'composition.tsx'))).toBe(true);
  });

  test('tsconfig.json contains correct jsx compiler options', () => {
    runCli(['init'], tmpDir);
    const tsconfig = JSON.parse(readFileSync(resolve(tmpDir, 'tsconfig.json'), 'utf-8'));
    expect(tsconfig.compilerOptions.jsx).toBe('react');
    expect(tsconfig.compilerOptions.jsxFactory).toBe('h');
    expect(tsconfig.compilerOptions.jsxFragmentFactory).toBe('Fragment');
  });

  test('composition.tsx imports CompositionConfig from grafex', () => {
    runCli(['init'], tmpDir);
    const content = readFileSync(resolve(tmpDir, 'composition.tsx'), 'utf-8');
    expect(content).toContain('CompositionConfig');
    expect(content).toContain('grafex');
  });

  test('composition.tsx has a default export function', () => {
    runCli(['init'], tmpDir);
    const content = readFileSync(resolve(tmpDir, 'composition.tsx'), 'utf-8');
    expect(content).toContain('export default function');
  });

  test('composition.tsx has a config export', () => {
    runCli(['init'], tmpDir);
    const content = readFileSync(resolve(tmpDir, 'composition.tsx'), 'utf-8');
    expect(content).toContain('export const config');
  });

  test('prints "Created tsconfig.json" to stdout', () => {
    const result = runCli(['init'], tmpDir);
    expect(result.stdout).toContain('Created tsconfig.json');
  });

  test('prints "Created composition.tsx" to stdout', () => {
    const result = runCli(['init'], tmpDir);
    expect(result.stdout).toContain('Created composition.tsx');
  });
});

describe('grafex init — skip existing files', () => {
  test('does not overwrite existing tsconfig.json, prints skip message', () => {
    const tsconfigPath = resolve(tmpDir, 'tsconfig.json');
    writeFileSync(tsconfigPath, '{"original": true}');
    const result = runCli(['init'], tmpDir);
    expect(result.status).toBe(0);
    const content = readFileSync(tsconfigPath, 'utf-8');
    expect(JSON.parse(content)).toEqual({ original: true });
    expect(result.stdout).toContain('Skipped tsconfig.json');
  });

  test('does not overwrite existing composition.tsx, prints skip message', () => {
    const compositionPath = resolve(tmpDir, 'composition.tsx');
    writeFileSync(compositionPath, '// original');
    const result = runCli(['init'], tmpDir);
    expect(result.status).toBe(0);
    expect(readFileSync(compositionPath, 'utf-8')).toBe('// original');
    expect(result.stdout).toContain('Skipped composition.tsx');
  });

  test('when tsconfig.json exists, still creates composition.tsx', () => {
    writeFileSync(resolve(tmpDir, 'tsconfig.json'), '{}');
    runCli(['init'], tmpDir);
    expect(existsSync(resolve(tmpDir, 'composition.tsx'))).toBe(true);
  });

  test('when composition.tsx exists, still creates tsconfig.json', () => {
    writeFileSync(resolve(tmpDir, 'composition.tsx'), '// original');
    runCli(['init'], tmpDir);
    expect(existsSync(resolve(tmpDir, 'tsconfig.json'))).toBe(true);
  });

  test('running init twice exits 0 both times', () => {
    const first = runCli(['init'], tmpDir);
    expect(first.status).toBe(0);
    const second = runCli(['init'], tmpDir);
    expect(second.status).toBe(0);
  });
});

describe('grafex init — help flag', () => {
  test('init --help exits 0', () => {
    const result = runCli(['init', '--help'], tmpDir);
    expect(result.status).toBe(0);
  });

  test('init --help shows usage information', () => {
    const result = runCli(['init', '--help'], tmpDir);
    expect(result.stdout).toContain('grafex init');
  });

  test('init -h exits 0 with help text', () => {
    const result = runCli(['init', '-h'], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('grafex init');
  });
});
