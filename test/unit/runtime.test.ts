import { describe, test, expect } from 'vitest';
import {
  h,
  Fragment,
  renderToHTML,
  styleObjectToString,
  escapeHtml,
  HtmlString,
} from '../../src/runtime.js';

describe('h() — string tags', () => {
  test('basic element with text child', () => {
    expect(String(h('div', null, 'hello'))).toBe('<div>hello</div>');
  });

  test('className maps to class attribute', () => {
    expect(String(h('div', { className: 'foo' }, 'x'))).toBe('<div class="foo">x</div>');
  });

  test('style object is serialized to CSS string', () => {
    expect(String(h('div', { style: { fontSize: '16px', backgroundColor: 'red' } }))).toBe(
      '<div style="font-size: 16px; background-color: red"></div>',
    );
  });

  test('null prop is omitted', () => {
    expect(String(h('div', { title: null }))).toBe('<div></div>');
  });

  test('undefined prop is omitted', () => {
    expect(String(h('div', { title: undefined }))).toBe('<div></div>');
  });

  test('boolean true prop emits attribute name only', () => {
    expect(String(h('input', { disabled: true }))).toBe('<input disabled>');
  });

  test('boolean false prop is omitted', () => {
    expect(String(h('input', { disabled: false }))).toBe('<input>');
  });

  test('number child renders as string', () => {
    expect(String(h('span', null, 42))).toBe('<span>42</span>');
  });

  test('multiple children are concatenated', () => {
    expect(String(h('div', null, 'a', 'b', 'c'))).toBe('<div>abc</div>');
  });

  test('nested elements', () => {
    expect(String(h('div', null, h('span', null, 'hi')))).toBe('<div><span>hi</span></div>');
  });
});

describe('h() — void elements (self-closing, no closing tag)', () => {
  test('img is self-closing', () => {
    expect(String(h('img', { src: 'a.png', alt: 'A' }))).toBe('<img src="a.png" alt="A">');
  });

  test('input is self-closing', () => {
    expect(String(h('input', null))).toBe('<input>');
  });

  test('br is self-closing', () => {
    expect(String(h('br', null))).toBe('<br>');
  });

  test('hr is self-closing', () => {
    expect(String(h('hr', null))).toBe('<hr>');
  });

  test('area is self-closing', () => {
    expect(String(h('area', null))).toBe('<area>');
  });

  test('base is self-closing', () => {
    expect(String(h('base', null))).toBe('<base>');
  });

  test('col is self-closing', () => {
    expect(String(h('col', null))).toBe('<col>');
  });

  test('embed is self-closing', () => {
    expect(String(h('embed', null))).toBe('<embed>');
  });

  test('link is self-closing', () => {
    expect(String(h('link', null))).toBe('<link>');
  });

  test('meta is self-closing', () => {
    expect(String(h('meta', null))).toBe('<meta>');
  });

  test('param is self-closing', () => {
    expect(String(h('param', null))).toBe('<param>');
  });

  test('source is self-closing', () => {
    expect(String(h('source', null))).toBe('<source>');
  });

  test('track is self-closing', () => {
    expect(String(h('track', null))).toBe('<track>');
  });

  test('wbr is self-closing', () => {
    expect(String(h('wbr', null))).toBe('<wbr>');
  });
});

describe('h() — function components', () => {
  test('function component is called with props and its return value used', () => {
    const Comp = ({ name }: { name: string }) => new HtmlString(`<b>${name}</b>`);
    expect(String(h(Comp as (props: Record<string, unknown>) => HtmlString, { name: 'X' }))).toBe(
      '<b>X</b>',
    );
  });

  test('function component receives children', () => {
    const Comp = ({ children }: { children?: unknown }) =>
      new HtmlString(`<section>${children}</section>`);
    expect(String(h(Comp as (props: Record<string, unknown>) => HtmlString, null, 'hello'))).toBe(
      '<section>hello</section>',
    );
  });

  test('nested function components resolve correctly', () => {
    const Inner = ({ label }: { label: string }) => h('span', null, label);
    const Outer = ({ title }: { title: string }) => h('div', null, h(Inner, { label: title }));
    expect(String(h(Outer, { title: 'hi' }))).toBe('<div><span>hi</span></div>');
  });
});

describe('renderChildren — special values', () => {
  test('null child renders as empty string', () => {
    expect(String(h('div', null, null))).toBe('<div></div>');
  });

  test('undefined child renders as empty string', () => {
    expect(String(h('div', null, undefined))).toBe('<div></div>');
  });

  test('false child renders as empty string', () => {
    expect(String(h('div', null, false))).toBe('<div></div>');
  });

  test('true child renders as empty string', () => {
    expect(String(h('div', null, true))).toBe('<div></div>');
  });

  test('array children are flattened recursively', () => {
    expect(String(h('div', null, [['a', 'b'], 'c']))).toBe('<div>abc</div>');
  });

  test('conditional rendering: false && element renders as empty', () => {
    expect(String(h('div', null, false && h('span', null, 'x')))).toBe('<div></div>');
  });

  test('list rendering: array of elements renders all items', () => {
    expect(
      String(
        h(
          'div',
          null,
          ['a', 'b', 'c'].map((s) => h('span', null, s)),
        ),
      ),
    ).toBe('<div><span>a</span><span>b</span><span>c</span></div>');
  });
});

describe('Fragment', () => {
  test('renders multiple children without a wrapper element', () => {
    expect(String(Fragment({ children: ['a', 'b'] }))).toBe('ab');
  });

  test('renders a single string child', () => {
    expect(String(Fragment({ children: 'hello' }))).toBe('hello');
  });

  test('renders no children as empty string', () => {
    expect(String(Fragment({}))).toBe('');
  });
});

describe('styleObjectToString', () => {
  test('converts camelCase to kebab-case', () => {
    expect(styleObjectToString({ fontSize: '16px' })).toBe('font-size: 16px');
  });

  test('handles multiple properties separated by semicolons', () => {
    expect(styleObjectToString({ fontSize: '16px', backgroundColor: 'red' })).toBe(
      'font-size: 16px; background-color: red',
    );
  });

  test('leaves already-lowercase properties unchanged', () => {
    expect(styleObjectToString({ color: 'blue' })).toBe('color: blue');
  });
});

describe('renderToHTML', () => {
  test('starts with <!DOCTYPE html>', () => {
    const html = renderToHTML('<p>hi</p>', { width: 1200, height: 630 });
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
  });

  test('contains width in px in style block', () => {
    const html = renderToHTML('<p>hi</p>', { width: 1200, height: 630 });
    expect(html).toContain('width: 1200px');
  });

  test('contains height in px in style block', () => {
    const html = renderToHTML('<p>hi</p>', { width: 1200, height: 630 });
    expect(html).toContain('height: 630px');
  });

  test('contains CSS reset', () => {
    const html = renderToHTML('<p>hi</p>', { width: 1200, height: 630 });
    expect(html).toContain('* { box-sizing: border-box; margin: 0; padding: 0; }');
  });

  test('contains the component HTML in body', () => {
    const html = renderToHTML('<p>hi</p>', { width: 1200, height: 630 });
    expect(html).toContain('<p>hi</p>');
  });

  test('contains charset meta tag', () => {
    const html = renderToHTML('', { width: 800, height: 600 });
    expect(html).toContain('charset');
  });

  test('contains overflow hidden on body', () => {
    const html = renderToHTML('', { width: 800, height: 600 });
    expect(html).toContain('overflow: hidden');
  });
});

describe('escapeHtml — text child escaping', () => {
  test('script tag in child is escaped', () => {
    expect(String(h('div', null, '<script>alert(1)</script>'))).toBe(
      '<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>',
    );
  });

  test('ampersand and angle brackets in text children are escaped', () => {
    expect(String(h('p', null, 'a & b < c > d'))).toBe('<p>a &amp; b &lt; c &gt; d</p>');
  });

  test('nested h() children are not double-escaped', () => {
    expect(String(h('div', null, h('span', null, 'hello')))).toBe('<div><span>hello</span></div>');
  });
});

describe('escapeHtml — attribute value escaping', () => {
  test('special characters in attribute values are escaped', () => {
    expect(String(h('div', { title: '&<>"\'' }))).toBe(
      '<div title="&amp;&lt;&gt;&quot;&#39;"></div>',
    );
  });

  test('injection attempt in attribute value is escaped', () => {
    expect(String(h('a', { href: '" onclick="x' }))).toBe('<a href="&quot; onclick=&quot;x"></a>');
  });

  test('className value is escaped', () => {
    expect(String(h('div', { className: 'a"b' }))).toBe('<div class="a&quot;b"></div>');
  });
});

describe('h() — data-* and aria-* attribute passthrough', () => {
  test('data-* attributes pass through unchanged', () => {
    expect(String(h('div', { 'data-testid': 'foo' }))).toBe('<div data-testid="foo"></div>');
  });

  test('aria-* attributes pass through unchanged', () => {
    expect(String(h('div', { 'aria-label': 'close' }))).toBe('<div aria-label="close"></div>');
  });

  test('data-* attributes are not camelCase-converted', () => {
    expect(String(h('button', { 'data-test-id': 'submit-btn' }))).toBe(
      '<button data-test-id="submit-btn"></button>',
    );
  });

  test('aria-* attributes are not camelCase-converted', () => {
    expect(String(h('input', { 'aria-describedby': 'hint-text' }))).toBe(
      '<input aria-describedby="hint-text">',
    );
  });
});

describe('HtmlString', () => {
  test('toString returns the wrapped value', () => {
    expect(new HtmlString('<b>bold</b>').toString()).toBe('<b>bold</b>');
  });

  test('String() coercion returns the wrapped value', () => {
    expect(String(new HtmlString('<i>italic</i>'))).toBe('<i>italic</i>');
  });
});

describe('h() — style and script raw content (no escaping)', () => {
  test('style child is NOT escaped', () => {
    expect(String(h('style', null, 'body { color: red }'))).toBe(
      '<style>body { color: red }</style>',
    );
  });

  test('style child with angle brackets is NOT escaped', () => {
    expect(String(h('style', null, '<script>alert("xss")</script>'))).toBe(
      '<style><script>alert("xss")</script></style>',
    );
  });

  test('script child is NOT escaped', () => {
    expect(String(h('script', null, 'if (a < b) { console.log("ok") }'))).toBe(
      '<script>if (a < b) { console.log("ok") }</script>',
    );
  });

  test('div child IS still escaped', () => {
    expect(String(h('div', null, '<b>bold</b>'))).toBe('<div>&lt;b&gt;bold&lt;/b&gt;</div>');
  });
});

describe('renderToHTML — fonts', () => {
  test('injects link tags for each font URL in head', () => {
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
    ];
    const html = renderToHTML('<p>hi</p>', { width: 1200, height: 630 }, fonts);
    expect(html).toContain(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&amp;display=swap" crossorigin>',
    );
    expect(html).toContain(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto&amp;display=swap" crossorigin>',
    );
  });

  test('link tags appear inside head', () => {
    const fonts = ['https://fonts.googleapis.com/css2?family=Inter&display=swap'];
    const html = renderToHTML('<p>hi</p>', { width: 800, height: 600 }, fonts);
    const headClose = html.indexOf('</head>');
    const linkPos = html.indexOf('<link rel="stylesheet"');
    expect(linkPos).toBeGreaterThan(-1);
    expect(linkPos).toBeLessThan(headClose);
  });

  test('empty fonts array produces no link tags', () => {
    const html = renderToHTML('<p>hi</p>', { width: 800, height: 600 }, []);
    expect(html).not.toContain('<link rel="stylesheet"');
  });

  test('undefined fonts produces no link tags', () => {
    const html = renderToHTML('<p>hi</p>', { width: 800, height: 600 });
    expect(html).not.toContain('<link rel="stylesheet"');
  });
});

describe('module exports', () => {
  test('h is exported', () => {
    expect(typeof h).toBe('function');
  });

  test('Fragment is exported', () => {
    expect(typeof Fragment).toBe('function');
  });

  test('renderToHTML is exported', () => {
    expect(typeof renderToHTML).toBe('function');
  });

  test('styleObjectToString is exported', () => {
    expect(typeof styleObjectToString).toBe('function');
  });

  test('escapeHtml is exported', () => {
    expect(typeof escapeHtml).toBe('function');
  });

  test('HtmlString is exported', () => {
    expect(typeof HtmlString).toBe('function');
  });
});
