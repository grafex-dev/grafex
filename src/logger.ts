const useColor = !process.env.NO_COLOR && process.stderr.isTTY !== false;

const c = (code: string, text: string): string => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);

const cyan = (s: string) => c('36', s);
const boldCyan = (s: string) => c('1;36', s);
const green = (s: string) => c('32', s);
const boldGreen = (s: string) => c('1;32', s);
const yellow = (s: string) => c('33', s);
const red = (s: string) => c('31', s);
const dim = (s: string) => c('2', s);
const bold = (s: string) => c('1;37', s);
const white = (s: string) => c('37', s);

function pad(label: string, width: number): string {
  return label + ' '.repeat(Math.max(1, width - label.length));
}

function renderTimeColor(ms: number): string {
  if (ms < 200) return green(`${ms}ms`);
  if (ms <= 1000) return yellow(`${ms}ms`);
  return red(`${ms}ms`);
}

export function logBanner(opts: {
  version: string;
  file: string;
  port: number;
  variants?: string[];
  currentVariant?: string | null;
  width?: number;
  height?: number;
  scale?: number;
  renderTime: number;
}): void {
  const lines: string[] = [''];
  lines.push(`  ${boldCyan('grafex')} ${dim(`v${opts.version}`)}`);
  lines.push('');
  lines.push(`  ${bold(pad('watching', 11))}${cyan(opts.file)}`);
  lines.push(`  ${bold(pad('preview', 11))}${cyan(`http://localhost:${opts.port}/`)}`);

  if (opts.variants && opts.variants.length > 0) {
    const names = opts.variants
      .map((v) => (v === opts.currentVariant ? bold(v) : white(v)))
      .join(dim(', '));
    lines.push(`  ${bold(pad('variants', 11))}${names}`);
  } else if (opts.width && opts.height) {
    const scaleStr = opts.scale && opts.scale !== 1 ? dim(` @ ${opts.scale}x`) : '';
    lines.push(`  ${bold(pad('size', 11))}${white(`${opts.width}x${opts.height}`)}${scaleStr}`);
  }

  lines.push('');
  lines.push(`  ${dim('ready in')} ${boldGreen(`${opts.renderTime}ms`)}`);
  lines.push('');
  process.stderr.write(lines.join('\n'));
}

export function logRender(opts: {
  width: number;
  height: number;
  ms: number;
  scale?: number;
  variant?: string | null;
}): void {
  const variant = opts.variant ? `${white(opts.variant)} ` : '';
  const scaleStr = dim(` @ ${opts.scale ?? 1}x`);
  process.stderr.write(
    `  ${green(pad('render', 9))}${variant}${dim(`${opts.width}x${opts.height}`)}${scaleStr} ${renderTimeColor(opts.ms)}\n`,
  );
}

export function logChange(file: string): void {
  process.stderr.write(`  ${dim(pad('change', 9))}${white(file)}\n`);
}

export function logVariant(name: string, width: number, height: number): void {
  process.stderr.write(`  ${cyan(pad('variant', 9))}${bold(name)} ${dim(`${width}x${height}`)}\n`);
}

export function logError(message: string): void {
  process.stderr.write(`  ${red(pad('error', 9))}${red(message)}\n`);
}

export function logWarn(message: string): void {
  process.stderr.write(`  ${yellow(pad('warn', 9))}${yellow(message)}\n`);
}
