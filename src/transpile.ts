import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function resolveRuntimePath(dir: string = __dirname): string {
  const jsPath = resolve(dir, 'runtime.js');
  if (existsSync(jsPath)) return jsPath;
  const tsPath = resolve(dir, 'runtime.ts');
  if (existsSync(tsPath)) return tsPath;
  throw new Error(`Grafex runtime not found. Expected runtime.js or runtime.ts at: ${dir}`);
}

export async function transpile(compositionPath: string): Promise<string> {
  const absolutePath = resolve(compositionPath);
  const runtimePath = resolveRuntimePath();

  let result;
  try {
    result = await build({
      entryPoints: [absolutePath],
      bundle: true,
      write: false,
      format: 'esm',
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      inject: [runtimePath],
      platform: 'node',
      target: 'node18',
      loader: { '.ts': 'ts', '.tsx': 'tsx' },
    });
  } catch (err) {
    throw new Error(`esbuild transpilation failed:\n${(err as Error).message}`);
  }

  return result.outputFiles[0].text;
}
