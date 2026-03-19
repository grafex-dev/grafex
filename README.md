# Grafex

**Images as Code. Write JSX, export PNG.**

Grafex is a programmatic image composition tool. Write compositions in JSX/TSX with full CSS support and export them to PNG — no browser window, no server, no configuration ceremony.

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

## CLI Reference

### `grafex export`

Render a composition file to a PNG image.

| Flag        | Short | Type          | Default        | Description                                             |
| ----------- | ----- | ------------- | -------------- | ------------------------------------------------------- |
| `--file`    | `-f`  | string        | —              | Path to the `.tsx` composition file **(required)**      |
| `--out`     | `-o`  | string        | `./output.png` | Output file path                                        |
| `--props`   |       | string (JSON) | `{}`           | Props to pass to the composition as a JSON object       |
| `--width`   |       | number        | from `config`  | Override composition width in pixels                    |
| `--height`  |       | number        | from `config`  | Override composition height in pixels                   |
| `--format`  |       | string        | `png`          | Output format (only `png` supported)                    |
| `--scale`   |       | number        | `1`            | Device pixel ratio. Use `2` for retina/high-DPI output. |
| `--browser` |       | string        | `webkit`       | Browser engine                                          |
| `--help`    | `-h`  |               |                | Show help text                                          |

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

### Global flags

```bash
grafex --version    # Print version and exit
grafex --help       # Print help text and exit
```

---

## Library API

```ts
import { render, close } from 'grafex';
```

### `render(compositionPath, options?)`

Render a composition to a PNG buffer.

```ts
const result = await render('./card.tsx', {
  props: { title: 'Hello' },
  width: 1200,
  height: 630,
  browser: 'webkit',
});

// result.buffer  — Buffer containing PNG data
// result.width   — effective render width
// result.height  — effective render height
// result.format  — 'png'
```

**Parameters:**

| Parameter         | Type                      | Description                          |
| ----------------- | ------------------------- | ------------------------------------ |
| `compositionPath` | `string`                  | Path to the `.tsx` composition file  |
| `options.props`   | `Record<string, unknown>` | Props to pass to the composition     |
| `options.width`   | `number`                  | Override composition width           |
| `options.height`  | `number`                  | Override composition height          |
| `options.browser` | `'webkit'`                | Browser engine (default: `'webkit'`) |

**Returns:** `Promise<RenderResult>` where `RenderResult` is:

```ts
interface RenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'png';
}
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

## License

MIT
