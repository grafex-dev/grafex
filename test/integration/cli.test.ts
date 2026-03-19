import { describe, test, expect, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const cliPath = resolve(rootDir, 'src/cli.ts');

function runCli(args: string[]) {
  return spawnSync('npx', ['tsx', cliPath, ...args], {
    cwd: rootDir,
    encoding: 'utf-8',
    timeout: 30000,
  });
}

afterAll(async () => {
  const { close } = await import('../../src/index.js');
  await close();
});

describe('export command — successful render', () => {
  test('exports simple.tsx to /tmp/out-cli-test.png, prints path to stdout, exits 0', () => {
    const outPath = '/tmp/grafex-cli-integration-test.png';
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--out', outPath]);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(outPath);
    expect(existsSync(outPath)).toBe(true);
    const buf = readFileSync(outPath);
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4e);
    expect(buf[3]).toBe(0x47);
  }, 30_000);

  test('--props passes parsed object as props to the composition', () => {
    const outPath = '/tmp/grafex-cli-integration-props-test.png';
    const result = runCli([
      'export',
      '--file',
      'test/fixtures/with-props.tsx',
      '--out',
      outPath,
      '--props',
      '{"title":"Hi"}',
    ]);
    expect(result.status).toBe(0);
    expect(existsSync(outPath)).toBe(true);
  }, 30_000);
});

describe('export command — error cases', () => {
  test('missing --file exits 1 with non-empty stderr', () => {
    const result = runCli(['export', '--out', '/tmp/grafex-no-file.png']);
    expect(result.status).toBe(1);
    expect(result.stderr.trim().length).toBeGreaterThan(0);
  });

  test('--format svg exits 1 with unsupported format message in stderr', () => {
    const result = runCli([
      'export',
      '--file',
      'test/fixtures/simple.tsx',
      '--format',
      'svg',
      '--out',
      '/tmp/grafex-svg-test.png',
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--format must be "png" or "jpeg"');
  });
});

describe('global flags', () => {
  test('--version exits 0 and stdout matches package.json version', () => {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8')) as {
      version: string;
    };
    const result = runCli(['--version']);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  test('--help exits 0 and stdout contains "export"', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('export');
  });
});
