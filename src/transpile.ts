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

export interface TranspileResult {
  code: string;
  inputs: string[];
}

export async function transpile(compositionPath: string): Promise<string>;
export async function transpile(
  compositionPath: string,
  withMetafile: true,
): Promise<TranspileResult>;
export async function transpile(
  compositionPath: string,
  withMetafile?: boolean,
): Promise<string | TranspileResult> {
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
      metafile: withMetafile ?? false,
      logLevel: 'silent',
      tsconfigRaw: {
        compilerOptions: {
          jsx: 'react',
          jsxFactory: 'h',
          jsxFragmentFactory: 'Fragment',
        },
      },
    });
  } catch (err) {
    const buildErr = err as {
      errors?: Array<{ text: string; location?: { file: string; line: number; column: number } }>;
    };
    if (buildErr.errors?.length) {
      const e = buildErr.errors[0];
      const loc = e.location ? `${e.location.file}:${e.location.line}:${e.location.column}: ` : '';
      throw new Error(`${loc}${e.text}`);
    }
    throw new Error(`esbuild transpilation failed:\n${(err as Error).message}`);
  }

  const code = result.outputFiles[0].text;

  if (withMetafile) {
    const inputs = Object.keys(result.metafile!.inputs).map((p) => resolve(p));
    return { code, inputs };
  }

  return code;
}
