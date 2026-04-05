# Tailwind CSS + Grafex Example

A working example of using Tailwind CSS with Grafex to generate OG images.

## Setup

```bash
npm install
```

> **Note:** `styles.css` is a generated file — it does not exist in the repo. For `npm run build`, run it directly after `npm install`. For `npm run dev`, no pre-build step is needed — `grafex dev` renders without styles initially and re-renders as soon as Tailwind generates the file.

## Development

Runs Tailwind's watcher and the Grafex dev server in parallel. Edit `card.tsx` — Tailwind recompiles `styles.css` and Grafex re-renders automatically.

```bash
npm run dev
```

Then open `http://localhost:3000` to see the live preview.

## Production build

Compiles the CSS once, then exports the composition as a PNG.

```bash
npm run build
```

Output: `card.png`

## How it works

1. `input.css` contains `@import "tailwindcss"` — Tailwind's entry point
2. Tailwind scans `card.tsx` for utility classes and compiles them into `styles.css`
3. `card.tsx` references `styles.css` via `config.css: ['./styles.css']`
4. Grafex injects the compiled CSS as a `<style>` tag before rendering

In dev mode, Tailwind's `--watch` flag recompiles `styles.css` on every file change. Grafex watches all files in `config.css`, so it detects the updated stylesheet and re-renders within ~100ms — no manual steps needed.
