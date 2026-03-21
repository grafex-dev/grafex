import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { watch, type FSWatcher } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import { transpile } from '../transpile.js';
import { renderToHTML } from '../runtime.js';
import { BrowserManager } from '../browser.js';
import { embedLocalAssets, embedCssAssets } from '../assets.js';
import type { CompositionConfig } from '../types.js';
import { logBanner, logRender, logChange, logError } from '../logger.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
let version = '0.0.0';
try {
  version = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8')).version;
} catch {
  try {
    version = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')).version;
  } catch {
    // fallback to 0.0.0
  }
}
const pkg = { version };

const HELP = `
Usage: grafex dev --file <path> [options]

Options:
  --file, -f    Path to the composition .tsx file (required)
  --port        Preview server port (default: 3000)
  --props       Props to pass as JSON (default: {})
  --variant     Show only the named variant (default: first variant)
  --help, -h    Show this help text
`.trim();

interface DevState {
  buffers: Map<string, Buffer>;
  sseClients: ServerResponse[];
  currentVariant: string | null;
  variants: string[];
  renderTime: number;
  compositionWidth: number;
  compositionHeight: number;
  compositionScale: number;
}

function openBrowser(url: string): void {
  const bin =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(bin, [url], { stdio: 'ignore', detached: true });
}

function buildWatchList(absolutePath: string, inputs: string[], cssPaths: string[]): Set<string> {
  const files = new Set<string>();
  files.add(absolutePath);
  for (const p of inputs) {
    files.add(p);
  }
  for (const p of cssPaths) {
    files.add(p);
  }
  return files;
}

function previewHtml(filename: string, state: DevState, pinnedVariant: string | undefined): string {
  const { compositionWidth, compositionHeight, compositionScale, variants, currentVariant } = state;
  const showSwitcher = variants.length > 1;

  const variantSwitcherHtml = showSwitcher
    ? `
    <div id="variant-bar" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">
      <label style="font-size:13px;color:#8b949e;">Variant:</label>
      <select id="variant-select" style="background:#161b22;color:#e6edf3;border:1px solid #30363d;border-radius:6px;padding:4px 8px;font-size:13px;cursor:pointer;">
        ${variants.map((v) => `<option value="${v}"${v === currentVariant ? ' selected' : ''}>${v}</option>`).join('')}
      </select>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>grafex dev — ${filename}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      background: #0B0E14;
      color: #e6edf3;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    #container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      max-width: 100%;
    }
    #img-wrapper {
      position: relative;
      background-color: #fff;
      background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
      overflow: hidden;
      box-shadow: 0 0 0 1px #30363d;
    }
    #preview-img {
      display: none;
      max-width: min(${compositionWidth}px, calc(100vw - 48px));
      height: auto;
    }
    #preview-img.loaded {
      display: block;
    }
    #loading {
      width: min(${compositionWidth}px, calc(100vw - 48px));
      aspect-ratio: ${compositionWidth} / ${compositionHeight};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #484f58;
      font-size: 14px;
    }
    #error-overlay {
      display: none;
      position: absolute;
      inset: 0;
      background: rgba(11,14,20,0.92);
      overflow: auto;
      padding: 20px;
    }
    #error-overlay pre {
      color: #f85149;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    #info-bar {
      font-size: 12px;
      color: #8b949e;
      display: flex;
      gap: 16px;
      align-items: center;
    }
    #info-bar span { display: flex; align-items: center; gap: 4px; }
    #render-time { color: #3fb950; }
  </style>
</head>
<body>
  <div id="container">
    ${variantSwitcherHtml}
    <div id="img-wrapper">
      <div id="loading">Rendering...</div>
      <img id="preview-img" alt="Composition preview" />
      <div id="error-overlay"><pre id="error-text"></pre></div>
    </div>
    <div id="info-bar">
      <span>${filename}</span>
      <span id="dimensions">${compositionWidth} &times; ${compositionHeight} @ ${compositionScale}x</span>
      <span id="render-time">${state.renderTime}ms</span>
    </div>
  </div>

  <script>
    const img = document.getElementById('preview-img');
    const loading = document.getElementById('loading');
    const errorOverlay = document.getElementById('error-overlay');
    const errorText = document.getElementById('error-text');
    const renderTimeEl = document.getElementById('render-time');
    const dimensionsEl = document.getElementById('dimensions');
    ${showSwitcher ? `const variantSelect = document.getElementById('variant-select');` : ''}

    function connectSSE() {
      const url = '/events' + (window.location.search || '');
      const es = new EventSource(url);

      es.addEventListener('open', () => {
        // On connect, try loading the current image (render may have finished before SSE connected)
        const testImg = new Image();
        testImg.onload = () => {
          loading.style.display = 'none';
          img.src = testImg.src;
          img.classList.add('loaded');
        };
        testImg.src = '/image?t=' + Date.now();
      });

      es.addEventListener('render', (e) => {
        const data = JSON.parse(e.data);
        loading.style.display = 'none';
        img.classList.add('loaded');
        errorOverlay.style.display = 'none';
        img.src = '/image?t=' + data.timestamp + (data.variant ? '&variant=' + encodeURIComponent(data.variant) : '');
        renderTimeEl.textContent = data.renderTime + 'ms';
        renderTimeEl.style.color = data.renderTime < 200 ? '#3fb950' : data.renderTime <= 1000 ? '#d29922' : '#f85149';
        if (data.width != null) {
          dimensionsEl.textContent = data.width + ' \u00d7 ' + data.height + ' @ ' + (data.scale || 1) + 'x';
        }
      });

      es.addEventListener('reload', () => {
        window.location.reload();
      });

      es.addEventListener('error_event', (e) => {
        const data = JSON.parse(e.data);
        errorText.textContent = data.message;
        errorOverlay.style.display = 'block';
      });

      es.onerror = () => {
        es.close();
        setTimeout(connectSSE, 3000);
      };
    }

    connectSSE();

    ${
      showSwitcher
        ? `
    variantSelect.addEventListener('change', () => {
      const name = variantSelect.value;
      history.replaceState(null, '', '/?variant=' + encodeURIComponent(name));
      fetch('/select-variant?name=' + encodeURIComponent(name)).catch(() => {});
    });
    `
        : ''
    }
  </script>
</body>
</html>`;
}

interface DevServer {
  close: () => Promise<void>;
  port: number;
}

export async function startDevServer(
  absolutePath: string,
  options: {
    port?: number;
    props?: Record<string, unknown>;
    variant?: string;
    manager?: BrowserManager;
  } = {},
): Promise<DevServer> {
  const port = options.port ?? 3000;
  const props = options.props ?? {};
  const pinnedVariant = options.variant;

  const manager = options.manager ?? new BrowserManager();
  const ownsManager = !options.manager;
  let bannerPrinted = false;

  const state: DevState = {
    buffers: new Map(),
    sseClients: [],
    currentVariant: pinnedVariant ?? null,
    variants: [],
    renderTime: 0,
    compositionWidth: 1200,
    compositionHeight: 630,
    compositionScale: 1,
  };

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let watchers: FSWatcher[] = [];
  let lastCodeHash = '';
  let lastErrorHash = '';
  let renderInProgress = false;
  let renderQueued = false;
  let queuedVariant: string | undefined;

  function sendSSE(clients: ServerResponse[], event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        // ignore disconnected clients
      }
    }
  }

  async function doRender(variant?: string): Promise<void> {
    if (renderInProgress) {
      renderQueued = true;
      queuedVariant = variant;
      return;
    }
    renderInProgress = true;
    try {
      const start = Date.now();
      try {
        const { code, inputs } = await transpile(absolutePath, true);

        const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${Date.now()}`;
        const mod = await import(dataUrl);

        const component = mod.default as (props: Record<string, unknown>) => unknown;
        const config: CompositionConfig = mod.config ?? {};

        const compositionDir = dirname(absolutePath);
        const width = config.width ?? 1200;
        const height = config.height ?? 630;
        const scale = config.scale ?? 1;

        state.compositionWidth = width;
        state.compositionHeight = height;
        state.compositionScale = scale;

        // Determine variants — detect config structure changes
        const configVariants: string[] = config.variants ? Object.keys(config.variants) : [];
        const prevVariants = state.variants;
        const variantsChanged =
          prevVariants.length !== configVariants.length ||
          prevVariants.some((v, i) => v !== configVariants[i]);
        state.variants = configVariants;

        // Determine active variant
        let activeVariant = variant ?? state.currentVariant;
        if (configVariants.length > 0) {
          if (!activeVariant || !configVariants.includes(activeVariant)) {
            activeVariant = configVariants[0];
          }
        } else {
          activeVariant = null;
        }
        state.currentVariant = activeVariant;

        // Resolve variant config if applicable
        let variantProps = props;
        if (activeVariant && config.variants) {
          const variantDef = config.variants[activeVariant];
          if (variantDef?.props) {
            variantProps = { ...props, ...variantDef.props };
          }
        }

        // Read CSS files
        const cssContents: string[] = [];
        const cssPaths: string[] = [];
        if (config.css && config.css.length > 0) {
          for (const cssPath of config.css) {
            const resolvedCssPath = resolve(compositionDir, cssPath);
            cssPaths.push(resolvedCssPath);
            let rawCss: string;
            try {
              rawCss = await readFile(resolvedCssPath, 'utf-8');
            } catch {
              throw new Error(
                `CSS file not found: "${resolvedCssPath}" (referenced in ${absolutePath})`,
              );
            }
            cssContents.push(await embedCssAssets(rawCss, dirname(resolvedCssPath)));
          }
        }

        // Skip re-render if inputs haven't changed (macOS fs.watch fires multiple events per save)
        // Include activeVariant so switching variants always triggers a render even when code is unchanged
        const contentHash = code + cssContents.join('') + (activeVariant ?? '');
        if (contentHash === lastCodeHash && bannerPrinted) {
          pendingChangeFile = null;
          return; // finally block still runs — renderInProgress will be cleared
        }
        lastCodeHash = contentHash;
        lastErrorHash = '';

        // Log the change that triggered this render (only when content actually changed)
        if (pendingChangeFile) {
          logChange(pendingChangeFile);
          pendingChangeFile = null;
        }

        const componentHtml = String(component(variantProps));
        const rawHtml = renderToHTML(componentHtml, { width, height }, config.fonts, cssContents);
        const html = await embedLocalAssets(rawHtml, compositionDir);

        const buffer = await manager.render(html, { width, height }, scale, 'png', undefined);
        state.buffers.set(activeVariant ?? '', buffer);
        state.renderTime = Date.now() - start;
        if (!bannerPrinted) {
          bannerPrinted = true;
          logBanner({
            version: pkg.version,
            file: basename(absolutePath),
            port,
            variants: state.variants.length > 0 ? state.variants : undefined,
            currentVariant: state.currentVariant,
            width,
            height,
            scale,
            renderTime: state.renderTime,
          });
        } else {
          logRender({ width, height, scale, ms: state.renderTime, variant: activeVariant });
        }

        // Rebuild watchers
        const watchFiles = buildWatchList(absolutePath, inputs, cssPaths);
        rebuildWatchers(watchFiles);

        if (variantsChanged) {
          sendSSE(state.sseClients, 'reload', {});
        } else {
          sendSSE(state.sseClients, 'render', {
            timestamp: Date.now(),
            renderTime: state.renderTime,
            variant: state.currentVariant,
            width,
            height,
            scale,
          });
        }
      } catch (err) {
        const message = (err as Error).message ?? String(err);

        // Skip duplicate errors from fs.watch event spam
        if (message === lastErrorHash) {
          pendingChangeFile = null;
          return;
        }
        lastErrorHash = message;
        lastCodeHash = ''; // Clear so fixing the error triggers a render

        // Log the change that triggered this error
        if (pendingChangeFile) {
          logChange(pendingChangeFile);
          pendingChangeFile = null;
        }

        logError(message);
        sendSSE(state.sseClients, 'error_event', { message, timestamp: Date.now() });
      }
    } finally {
      renderInProgress = false;
      if (renderQueued) {
        renderQueued = false;
        void doRender(queuedVariant);
      }
    }
  }

  let pendingChangeFile: string | null = null;

  function scheduleRender(variant?: string, changedFile?: string): void {
    if (changedFile) pendingChangeFile = changedFile;
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void doRender(variant);
    }, 100);
  }

  function rebuildWatchers(files: Set<string>): void {
    for (const w of watchers) {
      try {
        w.close();
      } catch {
        // ignore
      }
    }
    watchers = [];

    for (const file of files) {
      try {
        const watcher = watch(file, () => {
          scheduleRender(undefined, basename(file));
        });
        watchers.push(watcher);
      } catch {
        // ignore files we can't watch
      }
    }
  }

  function handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    if (url.pathname === '/') {
      const html = previewHtml(absolutePath.split('/').pop() ?? absolutePath, state, pinnedVariant);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (url.pathname === '/image') {
      const requestedVariant = url.searchParams.get('variant') ?? state.currentVariant ?? undefined;
      const bufferKey = requestedVariant ?? '';
      const buffer = state.buffers.get(bufferKey);
      if (buffer) {
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
        res.end(buffer);
      } else if (state.buffers.size > 0) {
        // Requested variant not yet rendered — trigger async re-render and serve a cached buffer
        void doRender(requestedVariant);
        const fallback =
          state.buffers.get(state.currentVariant ?? '') ?? state.buffers.values().next().value!;
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
        res.end(fallback);
      } else {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('Not ready yet');
      }
      return;
    }

    if (url.pathname === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(':\n\n'); // comment to establish connection
      state.sseClients.push(res);

      req.on('close', () => {
        const idx = state.sseClients.indexOf(res);
        if (idx !== -1) state.sseClients.splice(idx, 1);
      });
      return;
    }

    if (url.pathname === '/select-variant') {
      const name = url.searchParams.get('name');
      if (name && state.variants.includes(name)) {
        state.currentVariant = name;
        void doRender(name);
      }
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  }

  const server = createServer(handleRequest);

  await new Promise<void>((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, () => resolve());
  });

  const actualPort = (server.address() as { port: number }).port;
  // Banner will be printed after first render completes (logBanner needs dimensions)

  // Initial render (don't await — let it run in background while server is up)
  void doRender();

  return {
    port: actualPort,
    close: async () => {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
      }
      for (const w of watchers) {
        try {
          w.close();
        } catch {
          // ignore
        }
      }
      for (const client of state.sseClients) {
        try {
          client.end();
        } catch {
          // ignore
        }
      }
      await new Promise<void>((resolve) => server.close(() => resolve()));
      if (ownsManager) {
        await manager.close();
      }
    },
  };
}

export async function runDev(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      file: { type: 'string', short: 'f' },
      port: { type: 'string' },
      props: { type: 'string' },
      variant: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  });

  if (values.help) {
    process.stdout.write(HELP + '\n');
    process.exit(0);
  }

  if (!values.file) {
    process.stderr.write('Error: --file (-f) is required.\n');
    process.exit(1);
  }

  let port = 3000;
  if (values.port !== undefined) {
    const n = Number(values.port as string);
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
      process.stdout.write(
        `Error: --port must be an integer between 1 and 65535, got "${values.port}".\n`,
      );
      process.exit(1);
    }
    port = n;
  }

  let props: Record<string, unknown> = {};
  if (values.props !== undefined) {
    try {
      props = JSON.parse(values.props as string);
    } catch (err) {
      process.stdout.write(`Invalid JSON in --props: ${(err as Error).message}\n`);
      process.exit(1);
    }
  }

  const absolutePath = resolve(values.file as string);
  const url = `http://localhost:${port}`;

  const dev = await startDevServer(absolutePath, {
    port,
    props,
    variant: values.variant as string | undefined,
  });

  openBrowser(url);

  const shutdown = async () => {
    process.stdout.write('\n  Shutting down...\n');
    await dev.close();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}
