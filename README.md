# Grafex

**Images as Code. Write JSX, export as images.**

Grafex is a programmatic image composition tool. Write compositions in JSX/TSX with full CSS support and export as images — no browser window, no server, no configuration ceremony.

```
npx grafex export -f card.tsx -o card.png
```

---

## Requirements

- Node.js >= 20.0.0
- WebKit browser (installed automatically on `npm install`)

---

## Quick Start

```bash
npm install grafex
```

Write a composition:

```tsx
// card.tsx
import type { CompositionConfig } from 'grafex';

export const config: CompositionConfig = { width: 1200, height: 630 };

export default function Card() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '64px',
        fontWeight: 'bold',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Hello, Grafex!
    </div>
  );
}
```

Export it:

```bash
npx grafex export -f card.tsx -o card.png
```

---

## TypeScript Setup

For full JSX type-checking in your editor, add these compiler options to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
```

Grafex ships its own JSX type definitions (`JSX.Element`, `JSX.IntrinsicElements`, etc.). They are picked up automatically once the package is installed — no extra imports needed. The `h` and `Fragment` functions are injected at transpile time, so you never import them in composition files.

---

## CLI Reference

### `grafex export`

Render a composition file to an image.

| Flag        | Short | Type          | Default        | Description                                                   |
| ----------- | ----- | ------------- | -------------- | ------------------------------------------------------------- |
| `--file`    | `-f`  | string        | —              | Path to the `.tsx` composition file **(required)**            |
| `--out`     | `-o`  | string        | `./output.png` | Output file path or directory (for multi-variant output)      |
| `--props`   |       | string (JSON) | `{}`           | Props to pass to the composition as a JSON object             |
| `--width`   |       | number        | from `config`  | Override composition width in pixels                          |
| `--height`  |       | number        | from `config`  | Override composition height in pixels                         |
| `--format`  |       | string        | `png`          | Output format (`png` or `jpeg`)                               |
| `--quality` |       | number        | `90`           | JPEG quality 1–100 (only applies when format is `jpeg`)       |
| `--scale`   |       | number        | `1`            | Device pixel ratio. Use `2` for retina/high-DPI output.       |
| `--browser` |       | string        | `webkit`       | Browser engine: `webkit` or `chromium`                        |
| `--variant` |       | string        | (all)          | Render a single variant by name. Omit to render all variants. |
| `--help`    | `-h`  |               |                | Show help text                                                |

> **High-DPI output:** Set `scale` to control the device pixel ratio. A 1200x630 composition with `scale: 2` produces a 2400x1260 PNG — same layout, double the pixel density. Works in the config, CLI, and API.
>
> ```tsx
> export const config: CompositionConfig = {
>   width: 1200,
>   height: 630,
>   scale: 2,
> };
> ```

**Examples:**

```bash
# Basic export
grafex export -f card.tsx -o card.png

# Pass props to the composition
grafex export -f card.tsx -o card.png --props '{"title":"Hello World"}'

# Override dimensions
grafex export -f card.tsx -o card.png --width 800 --height 400

```

### `grafex dev`

Start a live preview server that watches your composition and re-renders on every file change.

```bash
npx grafex dev -f card.tsx
```

| Flag        | Short | Type          | Default | Description                                                 |
| ----------- | ----- | ------------- | ------- | ----------------------------------------------------------- |
| `--file`    | `-f`  | string        | —       | Path to the `.tsx` composition file **(required)**          |
| `--port`    |       | number        | `3000`  | Preview server port                                         |
| `--props`   |       | string (JSON) | `{}`    | Props to pass to the composition as a JSON object           |
| `--variant` |       | string        | (first) | Show only the named variant (when composition has variants) |
| `--help`    | `-h`  |               |         | Show help text                                              |

The dev server watches the composition file, all its imports, CSS files from `config.css`, and local image assets. Changes are debounced and the preview updates within ~100ms. Open `http://localhost:3000` to see the live preview.

Press `Ctrl+C` to stop.

### Global flags

```bash
grafex --version    # Print version and exit
grafex --help       # Print help text and exit
```

---

## Library API

```ts
import { render, renderAll, close } from 'grafex';
```

### `render(compositionPath, options?)`

Render a composition to an image buffer. Pass `options.variant` to render a specific variant from `config.variants`.

```ts
const result = await render('./card.tsx', {
  props: { title: 'Hello' },
  width: 1200,
  height: 630,
});

// result.buffer  — Buffer containing image data
// result.width   — effective render width
// result.height  — effective render height
// result.scale   — device pixel ratio used
// result.format  — 'png' | 'jpeg'
```

**Parameters:**

| Parameter         | Type                      | Description                                              |
| ----------------- | ------------------------- | -------------------------------------------------------- |
| `compositionPath` | `string`                  | Path to the `.tsx` composition file                      |
| `options.props`   | `Record<string, unknown>` | Props to pass to the composition                         |
| `options.width`   | `number`                  | Override composition width                               |
| `options.height`  | `number`                  | Override composition height                              |
| `options.format`  | `'png' \| 'jpeg'`         | Output format (default: `'png'`)                         |
| `options.quality` | `number`                  | JPEG quality 1–100 (default: `90`, only applies to JPEG) |
| `options.scale`   | `number`                  | Device pixel ratio (default: `1`)                        |
| `options.browser` | `'webkit' \| 'chromium'`  | Browser engine (default: `'webkit'`)                     |
| `options.variant` | `string`                  | Named variant to render from `config.variants`           |

**Returns:** `Promise<RenderResult>` where `RenderResult` is:

```ts
interface RenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  scale: number;
  format: 'png' | 'jpeg';
}
```

### `renderAll(compositionPath, options?)`

Render all variants defined in `config.variants`. Returns a `Map<string, RenderResult>` keyed by variant name.

```ts
import { renderAll, close } from 'grafex';
import { writeFileSync } from 'node:fs';

const all = await renderAll('./card.tsx', { props: { title: 'Hello' } });
for (const [name, result] of all) {
  writeFileSync(`${name}.${result.format}`, result.buffer);
}

await close();
```

### `close()`

Shut down the browser process. Call this when you are done rendering to free resources.

```ts
await close();
```

**Example — render multiple compositions:**

```ts
import { render, close } from 'grafex';
import { writeFileSync } from 'node:fs';

const compositions = ['hero.tsx', 'card.tsx', 'thumbnail.tsx'];

for (const file of compositions) {
  const result = await render(file);
  writeFileSync(file.replace('.tsx', '.png'), result.buffer);
}

await close();
```

### Advanced exports

```ts
import { h, Fragment, renderToHTML, BrowserManager } from 'grafex';
```

---

## CSS Files

Load external CSS files by specifying paths in `config.css`. Paths are resolved relative to the composition file:

```tsx
export const config: CompositionConfig = {
  width: 1200,
  height: 630,
  css: ['./styles.css'],
};
```

This works with any CSS — plain stylesheets, Tailwind output, Sass output, anything that produces a `.css` file. The contents are injected as `<style>` tags in the HTML `<head>` before rendering.

**Tailwind CSS example:**

```bash
# 1. Generate the CSS
npx tailwindcss -i ./input.css -o ./styles.css
```

```tsx
// card.tsx
export const config: CompositionConfig = {
  width: 1200,
  height: 630,
  css: ['./styles.css'],
};

export default function Card() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <h1 className="text-6xl font-bold">Hello Tailwind</h1>
    </div>
  );
}
```

```bash
# 2. Export the composition
npx grafex export -f card.tsx -o card.png
```

---

## Local Images

Use local image files in `<img>` tags or CSS `background-image`. Grafex reads them from disk and embeds them as base64 data URLs automatically — no server or public URL needed.

```tsx
export default function Card() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <img src="./logo.png" alt="Logo" width="200" height="60" />
    </div>
  );
}
```

Paths are resolved relative to the composition file. Supported formats: PNG, JPEG, GIF, WebP, SVG, AVIF, ICO, BMP.

CSS `url()` references work too — both in inline styles and in external CSS files loaded via `config.css`:

```css
.hero {
  background-image: url('./hero.jpg');
}
```

Remote URLs (`http://`, `https://`) and data URLs are passed through unchanged.

---

## Variants

Produce multiple outputs from a single composition — different sizes, formats, or props. Define a `variants` record in your config. Each variant inherits from the base config and can override any field:

```tsx
import type { CompositionConfig } from 'grafex';

export const config: CompositionConfig = {
  width: 1200,
  height: 630,
  variants: {
    og: {},
    twitter: { height: 675 },
    square: { width: 1080, height: 1080, props: { layout: 'square' } },
  },
};

export default function Card({ layout = 'default' }: { layout?: string }) {
  return <div style={{ width: '100%', height: '100%' }}>{layout}</div>;
}
```

**Export all variants:**

```bash
# Renders og.png, twitter.png, square.png (named after each variant)
grafex export -f card.tsx

# Same, but into a directory
grafex export -f card.tsx -o ./images/
```

**Export a single variant:**

```bash
grafex export -f card.tsx --variant og -o card-og.png
```

**Library API:**

```ts
import { render, renderAll, close } from 'grafex';

// Single variant
const result = await render('./card.tsx', { variant: 'twitter' });

// All variants
const all = await renderAll('./card.tsx');
for (const [name, result] of all) {
  writeFileSync(`${name}.${result.format}`, result.buffer);
}

await close();
```

**Merge rules:**

- CLI/API options override variant config, which overrides base config
- `props` are shallow-merged: variant props apply first, then CLI/API props override individual keys
- Array fields (`fonts`, `css`) replace the base value — they do not merge

---

## Browser Installation

WebKit is downloaded automatically when you run `npm install` via the `postinstall` script:

```bash
npm install grafex
# WebKit is installed automatically
```

To install manually:

```bash
npx playwright install webkit
```

To install only the browser binary without system dependencies:

```bash
npx playwright-core install webkit
```

**Chromium (alternative engine):** Grafex also supports Chromium if you hit CSS compatibility issues. Install it separately and pass `--browser chromium` to the CLI or `browser: 'chromium'` in the API:

```bash
npx playwright install chromium
grafex export -f card.tsx -o card.png --browser chromium
```

### `PLAYWRIGHT_BROWSERS_PATH`

By default, Playwright installs browsers to a shared cache directory. Set `PLAYWRIGHT_BROWSERS_PATH` to control where the browser binary is stored:

```bash
export PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
npx playwright install webkit
grafex export -f card.tsx -o card.png
```

This is useful in CI environments where the home directory may not be writable.

### CI Setup

On Linux, WebKit requires system dependencies. Install them with:

```bash
npx playwright install-deps webkit
npx playwright install webkit
```

**GitHub Actions example:**

```yaml
- name: Install WebKit dependencies
  run: npx playwright install-deps webkit

- name: Install WebKit
  run: npx playwright install webkit

- name: Export image
  run: npx grafex export -f card.tsx -o card.png
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, architecture overview, code standards, and PR guidelines.

---

## License

MIT
