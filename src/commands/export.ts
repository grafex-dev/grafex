import { parseArgs } from 'node:util';
import { writeFileSync } from 'node:fs';
import { render, close } from '../index.js';

const HELP = `
Usage: grafex export --file <path> [options]

Options:
  --file, -f    Path to the composition .tsx file (required)
  --out, -o     Output file path (default: ./output.png or ./output.svg)
  --props       Props to pass as JSON (default: {})
  --width       Override composition width (pixels)
  --height      Override composition height (pixels)
  --scale       Scale factor, e.g. 2 for retina PNG or larger SVG canvas (default: 1)
  --format      Output format: "png" or "svg" (default: png)
  --browser     Browser engine: webkit or chromium (default: webkit, PNG only)
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
      browser: { type: 'string' },
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

  const format = values.format ?? 'png';
  if (format !== 'png' && format !== 'svg') {
    process.stderr.write(`Error: --format must be "png" or "svg", got "${format}".\n`);
    process.exit(1);
  }

  const outPath = values.out ?? (format === 'svg' ? './output.svg' : './output.png');

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

  try {
    const result = await render(values.file as string, {
      props,
      width,
      height,
      scale,
      format: format as 'png' | 'svg',
      browser: browser as 'webkit' | 'chromium',
    });
    try {
      writeFileSync(outPath as string, result.buffer);
    } finally {
      await close();
    }
    process.stdout.write(outPath + '\n');
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  }
}
