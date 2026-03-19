import { describe, test, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const cliPath = resolve(rootDir, 'src/cli.ts');
const pkgJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));

function runCli(args: string[]) {
  return spawnSync('npx', ['tsx', cliPath, ...args], {
    cwd: rootDir,
    encoding: 'utf-8',
  });
}

describe('cli.ts — shebang', () => {
  test('src/cli.ts starts with #!/usr/bin/env node', () => {
    const content = readFileSync(cliPath, 'utf-8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });
});

describe('cli — global flags', () => {
  test('--version prints version from package.json and exits 0', () => {
    const result = runCli(['--version']);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(pkgJson.version);
  });

  test('-v prints version from package.json and exits 0', () => {
    const result = runCli(['-v']);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(pkgJson.version);
  });

  test('--help prints help listing export command and exits 0', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('export');
  });

  test('-h prints help and exits 0', () => {
    const result = runCli(['-h']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('export');
  });

  test('no subcommand prints help and exits 0', () => {
    const result = runCli([]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('export');
  });
});

describe('cli — subcommand routing', () => {
  test('unknown subcommand prints "Unknown command: <cmd>" to stderr and exits 1', () => {
    const result = runCli(['unknowncmd']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Unknown command: unknowncmd');
  });

  test('export --help prints export flag reference and exits 0', () => {
    const result = runCli(['export', '--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('--file');
  });
});

describe('export command — validation', () => {
  test('running without --file prints error to stderr and exits 1', () => {
    const result = runCli(['export']);
    expect(result.status).toBe(1);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  test('--format svg prints unsupported format error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--format', 'svg']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Only PNG format is supported in this version.');
  });

  test('--browser firefox prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--browser', 'firefox']);
    expect(result.status).toBe(1);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  test('--props with invalid JSON prints JSON parse error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--props', 'not json']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Invalid JSON in --props:');
  });

  test('--width with non-numeric value prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--width', 'abc']);
    expect(result.status).toBe(1);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  test('--width with fractional value "1.5" prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--width', '1.5']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--width must be a numeric value');
  });

  test('--width "1.0" is accepted (integer-valued float)', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--width', '1.0']);
    expect(result.stderr).not.toContain('--width must be a numeric value');
  });

  test('--scale 0 prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--scale', '0']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--scale must be a positive number');
  });

  test('--scale -1 prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--scale', '-1']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--scale must be a positive number');
  });

  test('--scale abc prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--scale', 'abc']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--scale must be a positive number');
  });

  test('--scale Infinity prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--scale', 'Infinity']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--scale must be a positive number');
  });

  test('--scale 1.5 is accepted (fractional scale)', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--scale', '1.5']);
    expect(result.stderr).not.toContain('--scale must be a positive number');
  });

  test('--scale 0.5 is accepted (sub-1 scale)', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--scale', '0.5']);
    expect(result.stderr).not.toContain('--scale must be a positive number');
  });
});
