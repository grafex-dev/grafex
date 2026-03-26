/**
 * Type-level tests for JSX type definitions.
 * This file must compile with `tsc --noEmit` without errors.
 * It does not run as a test — it just validates the types.
 */

/// <reference path="../../src/jsx.d.ts" />

import { h, Fragment } from '../../src/runtime.js';
import type { HtmlString } from '../../src/runtime.js';

// Basic elements compile without errors
const _div: JSX.Element = h('div', null);
const _span: JSX.Element = h('span', null);
const _h1: JSX.Element = h('h1', null);
const _p: JSX.Element = h('p', null);
const _section: JSX.Element = h('section', null);
const _article: JSX.Element = h('article', null);

// style prop accepts csstype CSSProperties object
const _styledDiv: JSX.Element = h('div', {
  style: {
    color: 'red',
    fontSize: '16px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    margin: '4px',
  },
});

// className prop accepts string
const _classDiv: JSX.Element = h('div', { className: 'container mx-auto' });

// class prop accepts string
const _classProp: JSX.Element = h('div', { class: 'container' });

// children: string
const _strChild: JSX.Element = h('div', null, 'hello');

// children: number
const _numChild: JSX.Element = h('span', null, 42);

// children: nested elements
const _nestedChildren: JSX.Element = h('div', null, h('span', null, 'inner'));

// children via prop
const _childrenProp: JSX.Element = h('div', { children: 'text' });

// Custom component functions work
function Card({ title }: { title: string }): HtmlString {
  return h('div', { className: 'card' }, title);
}
const _card: HtmlString = Card({ title: 'Hello' });

function Layout({ children }: { children?: HtmlString }): HtmlString {
  return h('main', null, children?.toString());
}
const _layout: HtmlString = Layout({ children: h('p', null, 'content') });

// data-* attributes work
const _dataAttr: JSX.Element = h('div', { 'data-testid': 'my-div' });
const _dataAttrNum: JSX.Element = h('button', { 'data-count': 5 });
const _dataAttrBool: JSX.Element = h('div', { 'data-active': true });

// aria-* attributes work
const _ariaLabel: JSX.Element = h('button', { 'aria-label': 'close' });
const _ariaHidden: JSX.Element = h('div', { 'aria-hidden': true });
const _ariaDescribedBy: JSX.Element = h('input', { 'aria-describedby': 'hint' });

// img element uses ImgHTMLAttributes: src, alt, width, height, crossOrigin, loading, decoding
const _imgAttrs: JSX.Element = h('img', { src: 'image.png', alt: 'An image' });
const _imgSize: JSX.Element = h('img', { src: 'img.png', alt: '', width: 800, height: 600 });
const _imgSizeStr: JSX.Element = h('img', {
  src: 'img.png',
  alt: '',
  width: '100%',
  height: 'auto',
});
const _imgLoading: JSX.Element = h('img', { src: 'img.png', alt: '', loading: 'lazy' });
const _imgDecoding: JSX.Element = h('img', { src: 'img.png', alt: '', decoding: 'async' });
const _imgCrossOrigin: JSX.Element = h('img', {
  src: 'img.png',
  alt: '',
  crossOrigin: 'anonymous',
});

// a element uses AnchorHTMLAttributes: href, target, rel, download
const _anchor: JSX.Element = h('a', {
  href: 'https://example.com',
  target: '_blank',
  rel: 'noopener',
});
const _anchorDownload: JSX.Element = h('a', { href: '/file.pdf', download: true });
const _anchorDownloadName: JSX.Element = h('a', { href: '/file.pdf', download: 'report.pdf' });

// link element uses LinkHTMLAttributes: href, rel, type, media, crossOrigin
const _linkTag: JSX.Element = h('link', { href: '/styles.css', rel: 'stylesheet' });
const _linkCrossOrigin: JSX.Element = h('link', {
  href: '/font.woff2',
  rel: 'preload',
  crossOrigin: 'anonymous',
});

// video element uses VideoHTMLAttributes
const _video: JSX.Element = h('video', {
  src: 'clip.mp4',
  width: 640,
  height: 480,
  controls: true,
  muted: true,
});
const _videoPreload: JSX.Element = h('video', { src: 'clip.mp4', preload: 'metadata' });

// audio element uses AudioHTMLAttributes
const _audio: JSX.Element = h('audio', { src: 'track.mp3', controls: true, loop: true });

// source element uses SourceHTMLAttributes
const _source: JSX.Element = h('source', { src: 'video.mp4', type: 'video/mp4' });
const _sourceSrcSet: JSX.Element = h('source', {
  srcSet: 'img-2x.png 2x',
  media: '(min-width: 800px)',
});

// meta element uses MetaHTMLAttributes
const _meta: JSX.Element = h('meta', { name: 'description', content: 'Page description' });
const _metaCharset: JSX.Element = h('meta', { charset: 'utf-8' });
const _metaOg: JSX.Element = h('meta', { property: 'og:title', content: 'Title' });

// script element uses ScriptHTMLAttributes
const _script: JSX.Element = h('script', { src: 'app.js', async: true, defer: true });

// style element uses StyleHTMLAttributes
const _styleEl: JSX.Element = h('style', { media: 'print', type: 'text/css' });

// table cell elements use TableCellHTMLAttributes: colSpan, rowSpan, scope
const _th: JSX.Element = h('th', { colSpan: 2, scope: 'col' });
const _td: JSX.Element = h('td', { rowSpan: 3 });

// ol element uses OlHTMLAttributes: start, reversed, type
const _ol: JSX.Element = h('ol', { start: 5, reversed: true, type: 'A' });

// li element uses LiHTMLAttributes: value
const _li: JSX.Element = h('li', { value: 3 });

// button element uses ButtonHTMLAttributes: type, disabled
const _button: JSX.Element = h('button', { type: 'submit', disabled: false });

// input element uses InputHTMLAttributes
const _input: JSX.Element = h('input', {
  type: 'text',
  placeholder: 'Enter name',
  name: 'username',
  required: true,
});
const _inputCheckbox: JSX.Element = h('input', { type: 'checkbox', checked: true });
const _inputRange: JSX.Element = h('input', { type: 'range', min: 0, max: 100, step: 5 });

// textarea element uses TextareaHTMLAttributes
const _textarea: JSX.Element = h('textarea', { rows: 4, cols: 40, placeholder: 'Write here...' });

// select element uses SelectHTMLAttributes
const _select: JSX.Element = h('select', { name: 'color', multiple: false, required: true });

// option element uses OptionHTMLAttributes
const _option: JSX.Element = h('option', { value: 'red', selected: true, label: 'Red' });

// label element uses LabelHTMLAttributes: htmlFor
const _label: JSX.Element = h('label', { htmlFor: 'username' });

// blockquote element uses BlockquoteHTMLAttributes: cite
const _blockquote: JSX.Element = h('blockquote', { cite: 'https://example.com/source' });

// html element uses HtmlHTMLAttributes: lang
const _html: JSX.Element = h('html', { lang: 'en' });

// Other common attributes
const _withId: JSX.Element = h('div', { id: 'main' });
const _withTitle: JSX.Element = h('div', { title: 'Tooltip text' });
const _withHidden: JSX.Element = h('div', { hidden: true });
const _withTabIndex: JSX.Element = h('div', { tabIndex: 0 });
const _withDir: JSX.Element = h('div', { dir: 'ltr' });
const _withRole: JSX.Element = h('div', { role: 'button' });

// Fragment works
const _frag: HtmlString = Fragment({
  children: [h('span', null, 'a'), h('span', null, 'b')] as unknown as string,
});

// HtmlString type is exported correctly
const _htmlString: HtmlString = h('div', null, 'test');

// JSX.Element is HtmlString
const _element: JSX.Element = h('div', null);
const _check: HtmlString = _element;

export {};
