import { parseArgs } from 'node:util';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { render, renderAll, close, getCompositionConfig, hasVariants } from '../index.js';

const HELP = `
Usage: grafex export --file <path> [options]

Options:
  --file, -f    Path to the composition .tsx file (required)
  --out, -o     Output file path or directory (default: ./ for multi-variant)
  --props       Props to pass as JSON (default: {})
  --width       Override composition width (pixels)
  --height      Override composition height (pixels)
  --scale       Device scale factor, e.g. 2 for retina (default: 1)
  --format      Output format: png or jpeg (default: png)
  --quality     JPEG quality 1-100 (default: 90, only applies to jpeg)
  --browser     Browser engine: webkit or chromium (default: webkit)
  --variant     Render only the named variant
  --help, -h    Show this help text
`.trim();

export async function runExport(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      file: { type: 'string', short: 'f' },
      out: { type: 'string', short: 'o' },
      props: { type: 'string' },
      width: { type: 'string' },
      height: { type: 'string' },
      scale: { type: 'string' },
      format: { type: 'string' },
      quality: { type: 'string' },
      browser: { type: 'string' },
      variant: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  });

  if (values.help) {
    process.stdout.write(HELP + '\n');
    process.exit(0);
  }

  if (!values.file) {
    process.stderr.write('Error: --file (-f) is required.\n');
    process.exit(1);
  }

  const rawFormat = values.format as string | undefined;
  const format = rawFormat === 'jpg' ? 'jpeg' : (rawFormat ?? 'png');
  if (format !== 'png' && format !== 'jpeg') {
    process.stderr.write(`Error: --format must be "png" or "jpeg", got "${rawFormat}".\n`);
    process.exit(1);
  }

  let quality: number | undefined;
  if (values.quality !== undefined) {
    const qualityStr = (values.quality as string).trim();
    const n = Number(qualityStr);
    if (!qualityStr || isNaN(n) || !Number.isInteger(n) || n < 1 || n > 100) {
      process.stderr.write(
        `Error: --quality must be an integer between 1 and 100, got "${values.quality}".\n`,
      );
      process.exit(1);
    }
    quality = n;
    if (format === 'png') {
      process.stderr.write('Warning: --quality has no effect for PNG format.\n');
    }
  }

  const browser = values.browser ?? 'webkit';
  if (browser !== 'webkit' && browser !== 'chromium') {
    process.stderr.write(`Error: --browser must be "webkit" or "chromium", got "${browser}".\n`);
    process.exit(1);
  }

  let props: Record<string, unknown> = {};
  if (values.props !== undefined) {
    try {
      props = JSON.parse(values.props as string);
    } catch (err) {
      process.stderr.write(`Invalid JSON in --props: ${(err as Error).message}\n`);
      process.exit(1);
    }
  }

  let width: number | undefined;
  if (values.width !== undefined) {
    const widthStr = (values.width as string).trim();
    const n = Number(widthStr);
    if (!widthStr || isNaN(n) || !Number.isInteger(n)) {
      process.stderr.write(`Error: --width must be a numeric value, got "${values.width}".\n`);
      process.exit(1);
    }
    width = n;
  }

  let height: number | undefined;
  if (values.height !== undefined) {
    const heightStr = (values.height as string).trim();
    const n = Number(heightStr);
    if (!heightStr || isNaN(n) || !Number.isInteger(n)) {
      process.stderr.write(`Error: --height must be a numeric value, got "${values.height}".\n`);
      process.exit(1);
    }
    height = n;
  }

  let scale: number | undefined;
  if (values.scale !== undefined) {
    const scaleStr = (values.scale as string).trim();
    const n = Number(scaleStr);
    if (!scaleStr || !isFinite(n) || n <= 0) {
      process.stderr.write(`Error: --scale must be a positive number, got "${values.scale}".\n`);
      process.exit(1);
    }
    scale = n;
  }

  const variantName = values.variant as string | undefined;
  const outPath = values.out as string | undefined;

  const renderOptions = {
    props,
    width,
    height,
    scale,
    format: format as 'png' | 'jpeg',
    quality,
    browser: browser as 'webkit' | 'chromium',
  };

  try {
    if (variantName !== undefined) {
      // Single variant render
      const singleOutPath = outPath ?? `./output.${format}`;
      const result = await render(values.file as string, {
        ...renderOptions,
        variant: variantName,
      });
      try {
        writeFileSync(singleOutPath, result.buffer);
      } finally {
        await close();
      }
      process.stdout.write(singleOutPath + '\n');
    } else {
      const config = await getCompositionConfig(values.file as string);

      if (hasVariants(config)) {
        // Multi-variant output
        const isDir =
          outPath === undefined ||
          outPath.endsWith('/') ||
          (existsSync(outPath) && statSync(outPath).isDirectory());

        if (!isDir && outPath !== undefined) {
          process.stderr.write(
            'Error: Cannot use a single output file with multiple variants. Use a directory path or --variant.\n',
          );
          process.exit(1);
        }

        const dir = outPath ?? './';
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        const allResults = await renderAll(values.file as string, renderOptions);
        const writtenPaths: string[] = [];
        try {
          for (const [name, result] of allResults) {
            const filePath = join(dir, `${name}.${result.format}`);
            writeFileSync(filePath, result.buffer);
            writtenPaths.push(filePath);
          }
        } finally {
          await close();
        }
        for (const p of writtenPaths) {
          process.stdout.write(p + '\n');
        }
      } else {
        // No variants — behave as before
        const singleOutPath = outPath ?? './output.png';
        const result = await render(values.file as string, renderOptions);
        try {
          writeFileSync(singleOutPath, result.buffer);
        } finally {
          await close();
        }
        process.stdout.write(singleOutPath + '\n');
      }
    }
  } catch (err) {
    await close();
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  }
}
