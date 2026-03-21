#!/usr/bin/env node
import { createRequire } from 'node:module';
import { runExport } from './commands/export.js';
import { runDev } from './commands/dev.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

const HELP = `
Usage: grafex <command> [options]

Commands:
  export    Render a composition to a PNG file
  dev       Watch a composition and serve a live preview

Global options:
  --version, -v    Print version and exit
  --help, -h       Print this help text and exit

Run "grafex <command> --help" for command-specific options.
`.trim();

const [command, ...rest] = process.argv.slice(2);

if (command === '--version' || command === '-v') {
  process.stdout.write(pkg.version + '\n');
  process.exit(0);
}

if (command === '--help' || command === '-h' || !command) {
  process.stdout.write(HELP + '\n');
  process.exit(0);
}

if (command === 'export') {
  runExport(rest).catch((err: unknown) => {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  });
} else if (command === 'dev') {
  runDev(rest).catch((err: unknown) => {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  });
} else {
  process.stderr.write(`Unknown command: ${command}\n`);
  process.exit(1);
}
