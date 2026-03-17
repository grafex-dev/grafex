import { describe, test, expect } from 'vitest';
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
  });
}

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
