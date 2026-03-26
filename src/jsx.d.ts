type Child =
  | import('./runtime.js').HtmlString
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[];

interface HTMLAttributes {
  id?: string;
  className?: string;
  class?: string;
  style?: import('csstype').Properties;
  title?: string;
  lang?: string;
  dir?: string;
  hidden?: boolean;
  role?: string;
  tabIndex?: number;
  children?: Child;
}

interface ImgHTMLAttributes extends HTMLAttributes {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  loading?: 'lazy' | 'eager';
  decoding?: 'sync' | 'async' | 'auto';
}

interface AnchorHTMLAttributes extends HTMLAttributes {
  href?: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
}

interface SourceHTMLAttributes extends HTMLAttributes {
  src?: string;
  srcSet?: string;
  type?: string;
  media?: string;
  sizes?: string;
}

interface VideoHTMLAttributes extends HTMLAttributes {
  src?: string;
  poster?: string;
  width?: number | string;
  height?: number | string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

interface AudioHTMLAttributes extends HTMLAttributes {
  src?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

interface MetaHTMLAttributes extends HTMLAttributes {
  name?: string;
  content?: string;
  charset?: string;
  httpEquiv?: string;
  property?: string;
}

interface LinkHTMLAttributes extends HTMLAttributes {
  href?: string;
  rel?: string;
  type?: string;
  media?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

interface StyleHTMLAttributes extends HTMLAttributes {
  media?: string;
  type?: string;
}

interface ScriptHTMLAttributes extends HTMLAttributes {
  src?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

interface TableCellHTMLAttributes extends HTMLAttributes {
  colSpan?: number;
  rowSpan?: number;
  headers?: string;
  scope?: 'col' | 'colgroup' | 'row' | 'rowgroup';
}

interface OlHTMLAttributes extends HTMLAttributes {
  start?: number;
  reversed?: boolean;
  type?: '1' | 'a' | 'A' | 'i' | 'I';
}

interface LiHTMLAttributes extends HTMLAttributes {
  value?: number;
}

interface ButtonHTMLAttributes extends HTMLAttributes {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

interface InputHTMLAttributes extends HTMLAttributes {
  type?: string;
  value?: string | number;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  checked?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number | string;
  min?: number | string;
  step?: number | string;
  readOnly?: boolean;
  required?: boolean;
}

interface TextareaHTMLAttributes extends HTMLAttributes {
  value?: string;
  placeholder?: string;
  name?: string;
  rows?: number;
  cols?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

interface SelectHTMLAttributes extends HTMLAttributes {
  value?: string | number;
  name?: string;
  disabled?: boolean;
  multiple?: boolean;
  required?: boolean;
}

interface OptionHTMLAttributes extends HTMLAttributes {
  value?: string | number;
  selected?: boolean;
  disabled?: boolean;
  label?: string;
}

interface LabelHTMLAttributes extends HTMLAttributes {
  htmlFor?: string;
}

interface BlockquoteHTMLAttributes extends HTMLAttributes {
  cite?: string;
}

declare function h(
  tag: string | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown> | null,
  ...children: unknown[]
): JSX.Element;

declare function Fragment(props: { children?: unknown }): JSX.Element;

declare namespace JSX {
  type Element = import('./runtime.js').HtmlString;

  interface ElementChildrenAttribute {
    children: {};
  }

  interface IntrinsicElements {
    div: HTMLAttributes;
    section: HTMLAttributes;
    article: HTMLAttributes;
    main: HTMLAttributes;
    header: HTMLAttributes;
    footer: HTMLAttributes;
    nav: HTMLAttributes;
    aside: HTMLAttributes;
    h1: HTMLAttributes;
    h2: HTMLAttributes;
    h3: HTMLAttributes;
    h4: HTMLAttributes;
    h5: HTMLAttributes;
    h6: HTMLAttributes;
    p: HTMLAttributes;
    span: HTMLAttributes;
    strong: HTMLAttributes;
    em: HTMLAttributes;
    b: HTMLAttributes;
    i: HTMLAttributes;
    u: HTMLAttributes;
    small: HTMLAttributes;
    sub: HTMLAttributes;
    sup: HTMLAttributes;
    code: HTMLAttributes;
    pre: HTMLAttributes;
    blockquote: BlockquoteHTMLAttributes;
    img: ImgHTMLAttributes;
    video: VideoHTMLAttributes;
    audio: AudioHTMLAttributes;
    source: SourceHTMLAttributes;
    picture: HTMLAttributes;
    svg: HTMLAttributes;
    a: AnchorHTMLAttributes;
    button: ButtonHTMLAttributes;
    ul: HTMLAttributes;
    ol: OlHTMLAttributes;
    li: LiHTMLAttributes;
    table: HTMLAttributes;
    thead: HTMLAttributes;
    tbody: HTMLAttributes;
    tr: HTMLAttributes;
    th: TableCellHTMLAttributes;
    td: TableCellHTMLAttributes;
    input: InputHTMLAttributes;
    label: LabelHTMLAttributes;
    select: SelectHTMLAttributes;
    option: OptionHTMLAttributes;
    textarea: TextareaHTMLAttributes;
    html: HTMLAttributes;
    head: HTMLAttributes;
    body: HTMLAttributes;
    meta: MetaHTMLAttributes;
    link: LinkHTMLAttributes;
    style: StyleHTMLAttributes;
    script: ScriptHTMLAttributes;
    title: HTMLAttributes;
    br: HTMLAttributes;
    hr: HTMLAttributes;
  }
}
