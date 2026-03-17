import { build } from 'esbuild';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function transpile(compositionPath: string): Promise<string> {
  const runtimePath = resolve(__dirname, 'runtime.ts');

  const result = await build({
    entryPoints: [compositionPath],
    bundle: true,
    write: false,
    format: 'esm',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    inject: [runtimePath],
    define: {},
    platform: 'node',
    target: 'node18',
  });

  return result.outputFiles[0].text;
}
