import { parseArgs } from 'node:util';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HELP = `
Usage: grafex init

Scaffold the minimal setup to start writing Grafex compositions.

Creates the following files in the current directory:
  tsconfig.json      TypeScript config with JSX settings for Grafex
  composition.tsx    A starter composition with a "Hello, Grafex!" example

If a file already exists, it is skipped — no existing files are overwritten.

Options:
  --help, -h    Show this help text
`.trim();

const TSCONFIG_CONTENT =
  JSON.stringify(
    {
      compilerOptions: {
        jsx: 'react',
        jsxFactory: 'h',
        jsxFragmentFactory: 'Fragment',
      },
    },
    null,
    2,
  ) + '\n';

const COMPOSITION_CONTENT = `import type { CompositionConfig } from 'grafex';

export const config: CompositionConfig = {
  width: 1200,
  height: 630,
};

export default function Composition() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '64px',
        fontWeight: 'bold',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Hello, Grafex!
    </div>
  );
}
`;

export function runInit(args: string[]): void {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  });

  if (values.help) {
    process.stdout.write(HELP + '\n');
    process.exit(0);
  }

  const cwd = process.cwd();

  const tsconfigPath = join(cwd, 'tsconfig.json');
  if (existsSync(tsconfigPath)) {
    process.stdout.write('Skipped tsconfig.json (already exists)\n');
  } else {
    writeFileSync(tsconfigPath, TSCONFIG_CONTENT);
    process.stdout.write('Created tsconfig.json\n');
  }

  const compositionPath = join(cwd, 'composition.tsx');
  if (existsSync(compositionPath)) {
    process.stdout.write('Skipped composition.tsx (already exists)\n');
  } else {
    writeFileSync(compositionPath, COMPOSITION_CONTENT);
    process.stdout.write('Created composition.tsx\n');
  }
}
