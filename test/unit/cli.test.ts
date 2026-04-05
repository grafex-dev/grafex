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

  test('--help lists the dev command', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('dev');
  });
});

describe('dev command — validation', () => {
  test('dev --help exits 0 and shows dev help text', () => {
    const result = runCli(['dev', '--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('--file');
    expect(result.stdout).toContain('--port');
  });

  test('dev without --file exits 1', () => {
    const result = runCli(['dev']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--file');
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
    expect(result.stderr).toContain('--format must be "png" or "jpeg"');
  });

  test('--format bmp prints unsupported format error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--format', 'bmp']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--format must be "png" or "jpeg"');
  });

  test('--format jpeg is accepted', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--format', 'jpeg']);
    expect(result.stderr).not.toContain('--format must be "png" or "jpeg"');
  });

  test('--format jpg is accepted as alias for jpeg', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--format', 'jpg']);
    expect(result.stderr).not.toContain('--format must be "png" or "jpeg"');
  });

  test('--quality 90 is accepted', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--quality', '90']);
    expect(result.stderr).not.toContain('--quality must be');
  });

  test('--quality 0 prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--quality', '0']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--quality must be an integer between 1 and 100');
  });

  test('--quality 101 prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--quality', '101']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--quality must be an integer between 1 and 100');
  });

  test('--quality abc prints error to stderr and exits 1', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--quality', 'abc']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--quality must be an integer between 1 and 100');
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

describe('cli — init command routing', () => {
  test('init --help exits 0 and shows init help text', () => {
    const result = runCli(['init', '--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('grafex init');
  });

  test('--help lists the init command', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('init');
  });
});

describe('export command — --variant flag', () => {
  test('--variant is accepted as a valid flag (no "unknown option" error)', () => {
    const result = runCli([
      'export',
      '--file',
      'test/fixtures/with-variants.tsx',
      '--variant',
      'og',
    ]);
    expect(result.stderr).not.toContain('unknown option');
    expect(result.stderr).not.toContain('Unknown option');
  });

  test('--variant with unknown variant name prints descriptive error to stderr', () => {
    const result = runCli([
      'export',
      '--file',
      'test/fixtures/with-variants.tsx',
      '--variant',
      'nonexistent',
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('nonexistent');
  });

  test('--variant on composition without variants prints error to stderr', () => {
    const result = runCli(['export', '--file', 'test/fixtures/simple.tsx', '--variant', 'og']);
    expect(result.status).toBe(1);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  test('--variant og appears in --help output', () => {
    const result = runCli(['export', '--help']);
    expect(result.stdout).toContain('--variant');
  });
});
