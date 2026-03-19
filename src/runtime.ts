type StyleObject = Record<string, string | number>;

type Props = Record<string, unknown> & {
  style?: StyleObject;
  children?: unknown;
};

export class HtmlString {
  constructor(public readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export function styleObjectToString(style: StyleObject): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

function renderChildren(children: unknown): string {
  if (children === null || children === undefined || children === false || children === true) {
    return '';
  }
  if (children instanceof HtmlString) return children.value;
  if (typeof children === 'string') return escapeHtml(children);
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(renderChildren).join('');
  return String(children);
}

function renderRawChildren(children: unknown): string {
  if (children === null || children === undefined || children === false || children === true) {
    return '';
  }
  if (children instanceof HtmlString) return children.value;
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(renderRawChildren).join('');
  return String(children);
}

const RAW_TEXT_ELEMENTS = new Set(['style', 'script']);

export function h(
  tag: string | ((props: Props) => HtmlString),
  props: Props | null,
  ...children: unknown[]
): HtmlString {
  const allProps = props ?? {};
  const flatChildren = children.flat(Infinity);
  const isRaw = typeof tag === 'string' && RAW_TEXT_ELEMENTS.has(tag);
  const renderFn = isRaw ? renderRawChildren : renderChildren;
  const childContent =
    'children' in allProps ? renderFn(allProps.children) : flatChildren.map(renderFn).join('');

  if (typeof tag === 'function') {
    return tag({ ...allProps, children: childContent });
  }

  const attrs = Object.entries(allProps)
    .filter(([key]) => key !== 'children')
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => {
      if (key === 'style' && typeof value === 'object' && value !== null) {
        return `style="${styleObjectToString(value as StyleObject)}"`;
      }
      if (key === 'className') return `class="${escapeHtml(String(value))}"`;
      if (value === true) return key;
      return `${key}="${escapeHtml(String(value))}"`;
    })
    .join(' ');

  const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

  if (VOID_ELEMENTS.has(tag)) return new HtmlString(openTag);

  return new HtmlString(`${openTag}${childContent}</${tag}>`);
}

export function Fragment({ children }: { children?: unknown }): HtmlString {
  return new HtmlString(renderChildren(children));
}

export function renderToHTML(
  componentHtml: string,
  viewport: { width: number; height: number },
  fonts?: string[],
): string {
  const fontLinks =
    fonts && fonts.length > 0
      ? fonts
          .map((url) => `<link rel="stylesheet" href="${escapeHtml(url)}" crossorigin>`)
          .join('\n') + '\n'
      : '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${fontLinks}<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${viewport.width}px; height: ${viewport.height}px; overflow: hidden; }
</style>
</head>
<body>
${componentHtml}
</body>
</html>`;
}

export function renderToSVG(
  componentHtml: string,
  viewport: { width: number; height: number },
  scale: number = 1,
  fonts?: string[],
): string {
  const { width, height } = viewport;
  const physicalWidth = Math.round(width * scale);
  const physicalHeight = Math.round(height * scale);
  const fontLinks =
    fonts && fonts.length > 0
      ? `${fonts
          .map((url) => `<link rel="stylesheet" href="${escapeHtml(url)}" crossorigin/>`)
          .join('\n')}\n`
      : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="${physicalWidth}" height="${physicalHeight}" viewBox="0 0 ${width} ${height}">
<foreignObject width="${width}" height="${height}">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
${fontLinks}<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${width}px; height: ${height}px; overflow: hidden; }
</style>
</head>
<body>
${componentHtml}
</body>
</html>
</foreignObject>
</svg>`;
}
