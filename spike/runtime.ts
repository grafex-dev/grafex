type StyleObject = Record<string, string | number>;

type Props = Record<string, unknown> & {
  style?: StyleObject;
  children?: unknown;
};

function styleObjectToString(style: StyleObject): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

function renderChildren(children: unknown): string {
  if (children === null || children === undefined || children === false) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(renderChildren).join('');
  return String(children);
}

export function h(
  tag: string | ((props: Props) => string),
  props: Props | null,
  ...children: unknown[]
): string {
  const allProps = props ?? {};
  const flatChildren = children.flat(Infinity);
  const childContent =
    'children' in allProps
      ? renderChildren(allProps.children)
      : flatChildren.map(renderChildren).join('');

  if (typeof tag === 'function') {
    return tag({ ...allProps, children: childContent });
  }

  const attrs = Object.entries(allProps)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => {
      if (key === 'style' && typeof value === 'object' && value !== null) {
        return `style="${styleObjectToString(value as StyleObject)}"`;
      }
      if (key === 'className') return `class="${value}"`;
      return `${key}="${value}"`;
    })
    .join(' ');

  const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  if (voidElements.has(tag)) return openTag;

  return `${openTag}${childContent}</${tag}>`;
}

export function Fragment({ children }: { children?: unknown }): string {
  return renderChildren(children);
}

export function renderToHTML(
  component: string,
  viewport: { width: number; height: number },
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${viewport.width}px; height: ${viewport.height}px; overflow: hidden; }
</style>
</head>
<body>
${component}
</body>
</html>`;
}
