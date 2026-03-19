import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
};

const SIZE_WARN_THRESHOLD = 5 * 1024 * 1024;

function isRemoteUrl(src: string): boolean {
  return (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('//')
  );
}

function mimeTypeForPath(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  const ext = dot !== -1 ? filePath.slice(dot).toLowerCase() : '';
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

async function fileToDataUrl(filePath: string): Promise<string> {
  let data: Buffer;
  try {
    data = await readFile(filePath);
  } catch {
    throw new Error(`Asset file not found: "${filePath}"`);
  }
  if (data.length > SIZE_WARN_THRESHOLD) {
    process.stderr.write(
      `grafex: warning: asset file is larger than 5MB: "${filePath}" (${(data.length / 1024 / 1024).toFixed(1)}MB)\n`,
    );
  }
  const mime = mimeTypeForPath(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

async function embedCssUrls(css: string, baseDir: string): Promise<string> {
  const pattern = /url\(\s*(['"]?)([^'")\s]+)\1\s*\)/g;
  const matches: Array<{ full: string; quote: string; src: string }> = [];

  let m: RegExpExecArray | null;
  while ((m = pattern.exec(css)) !== null) {
    matches.push({ full: m[0], quote: m[1], src: m[2] });
  }

  let result = css;
  for (const { full, quote, src } of matches) {
    if (isRemoteUrl(src)) continue;
    const absolutePath = resolve(baseDir, src);
    const dataUrl = await fileToDataUrl(absolutePath);
    result = result.replaceAll(full, () => `url(${quote}${dataUrl}${quote})`);
  }

  return result;
}

export async function embedLocalAssets(html: string, baseDir: string): Promise<string> {
  // Replace <img src="..."> with local paths
  const imgPattern = /(<img\b[^>]*?\bsrc\s*=\s*)(["'])([^"']+)\2/gi;
  const imgMatches: Array<{ full: string; prefix: string; quote: string; src: string }> = [];

  let m: RegExpExecArray | null;
  while ((m = imgPattern.exec(html)) !== null) {
    imgMatches.push({ full: m[0], prefix: m[1], quote: m[2], src: m[3] });
  }

  let result = html;
  for (const { full, prefix, quote, src } of imgMatches) {
    if (isRemoteUrl(src)) continue;
    const absolutePath = resolve(baseDir, src);
    const dataUrl = await fileToDataUrl(absolutePath);
    result = result.replaceAll(full, () => `${prefix}${quote}${dataUrl}${quote}`);
  }

  // Replace url() in inline style attributes
  const styleAttrPattern = /(\bstyle\s*=\s*)(["'])(.*?)\2/gis;
  const styleAttrMatches: Array<{ full: string; prefix: string; quote: string; content: string }> =
    [];

  while ((m = styleAttrPattern.exec(result)) !== null) {
    styleAttrMatches.push({ full: m[0], prefix: m[1], quote: m[2], content: m[3] });
  }

  for (const { full, prefix, quote, content } of styleAttrMatches) {
    if (!content.includes('url(')) continue;
    const embedded = await embedCssUrls(content, baseDir);
    if (embedded !== content) {
      result = result.replace(full, () => `${prefix}${quote}${embedded}${quote}`);
    }
  }

  // Replace url() in <style> blocks
  const styleBlockPattern = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
  const styleBlockMatches: Array<{ full: string; open: string; content: string; close: string }> =
    [];

  while ((m = styleBlockPattern.exec(result)) !== null) {
    styleBlockMatches.push({ full: m[0], open: m[1], content: m[2], close: m[3] });
  }

  for (const { full, open, content, close } of styleBlockMatches) {
    if (!content.includes('url(')) continue;
    const embedded = await embedCssUrls(content, baseDir);
    if (embedded !== content) {
      result = result.replace(full, () => `${open}${embedded}${close}`);
    }
  }

  return result;
}

export async function embedCssAssets(css: string, cssFileDir: string): Promise<string> {
  return embedCssUrls(css, cssFileDir);
}
