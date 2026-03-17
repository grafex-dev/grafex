import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { renderComposition } from './render.js';
import { PlaywrightEngine } from './engines/playwright.js';
import { SparticuzEngine } from './engines/sparticuz.js';
import type { BrowserEngine } from './engines/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const COMPOSITIONS = [
  { name: 'simple', path: resolve(__dirname, 'compositions/simple.tsx') },
  { name: 'og-card', path: resolve(__dirname, 'compositions/og-card.tsx') },
  { name: 'complex', path: resolve(__dirname, 'compositions/complex.tsx') },
];

const WARMUP_RUNS = 3;
const BENCHMARK_RUNS = 20;

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function getBrowserRssMb(pid: number | undefined): number | null {
  if (!pid) return null;
  try {
    const out = execSync(`ps -o rss= -p ${pid}`, { encoding: 'utf8' }).trim();
    const kb = parseInt(out, 10);
    return isNaN(kb) ? null : Math.round(kb / 1024);
  } catch {
    return null;
  }
}

function playwrightCacheBase(): string {
  // macOS uses ~/Library/Caches, Linux uses ~/.cache
  if (process.platform === 'darwin') {
    return join(homedir(), 'Library', 'Caches', 'ms-playwright');
  }
  return join(homedir(), '.cache', 'ms-playwright');
}

function findPlaywrightDir(prefix: string): string | null {
  const base = playwrightCacheBase();
  try {
    const dirs = execSync(`ls "${base}" 2>/dev/null`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((d) => d.startsWith(prefix));
    return dirs.length > 0 ? join(base, dirs[0]) : null;
  } catch {
    return null;
  }
}

function getDiskFootprintMb(engine: BrowserEngine): string {
  try {
    if (engine.name === 'chromium') {
      const dir = findPlaywrightDir('chromium_headless_shell-');
      if (!dir) return 'N/A';
      const out = execSync(`du -sm "${dir}"`, { encoding: 'utf8' });
      return `${out.split('\t')[0]}MB`;
    }
    if (engine.name === 'webkit') {
      const dir = findPlaywrightDir('webkit-');
      if (!dir) return 'N/A';
      const out = execSync(`du -sm "${dir}"`, { encoding: 'utf8' });
      return `${out.split('\t')[0]}MB`;
    }
    if (engine.name === 'firefox') {
      const dir = findPlaywrightDir('firefox-');
      if (!dir) return 'N/A';
      const out = execSync(`du -sm "${dir}"`, { encoding: 'utf8' });
      return `${out.split('\t')[0]}MB`;
    }
    if (engine.name === 'sparticuz') {
      const binDir = resolve(__dirname, 'node_modules/@sparticuz/chromium/bin');
      if (!existsSync(binDir)) return 'N/A';
      const out = execSync(`du -sm "${binDir}"`, { encoding: 'utf8' });
      return `${out.split('\t')[0]}MB (compressed)`;
    }
    return 'N/A';
  } catch {
    return 'N/A';
  }
}

interface EngineResult {
  engine: string;
  coldStartMs: number | null;
  error: string | null;
  compositions: CompositionResult[];
  diskFootprint: string;
  peakBrowserRssMb: number | null;
  peakNodeRssMb: number;
}

interface CompositionResult {
  name: string;
  warmRenderP50Ms: number | null;
  warmRenderP95Ms: number | null;
  warmRenderMaxMs: number | null;
  renderTimesMs: number[];
  error: string | null;
}

async function benchmarkEngine(engine: BrowserEngine): Promise<EngineResult> {
  console.log(`\n--- Engine: ${engine.name} ---`);

  const result: EngineResult = {
    engine: engine.name,
    coldStartMs: null,
    error: null,
    compositions: [],
    diskFootprint: getDiskFootprintMb(engine),
    peakBrowserRssMb: null,
    peakNodeRssMb: 0,
  };

  // Cold start measurement
  const coldT0 = process.hrtime.bigint();
  try {
    await engine.launch();
  } catch (err) {
    result.error = String(err);
    console.error(`  Launch failed: ${err}`);
    return result;
  }
  const coldT1 = process.hrtime.bigint();
  result.coldStartMs = Number(coldT1 - coldT0) / 1_000_000;
  console.log(`  Cold start: ${result.coldStartMs.toFixed(0)}ms`);

  // Initial RSS measurement
  const pid = engine.getPid();

  for (const comp of COMPOSITIONS) {
    console.log(`  Composition: ${comp.name}`);
    const compResult: CompositionResult = {
      name: comp.name,
      warmRenderP50Ms: null,
      warmRenderP95Ms: null,
      warmRenderMaxMs: null,
      renderTimesMs: [],
      error: null,
    };

    try {
      // Warmup runs
      for (let i = 0; i < WARMUP_RUNS; i++) {
        await renderComposition(comp.path, engine);
      }

      // Benchmark runs
      const renderTimes: number[] = [];
      let peakRss = 0;

      for (let i = 0; i < BENCHMARK_RUNS; i++) {
        const r = await renderComposition(comp.path, engine);
        renderTimes.push(r.renderMs);

        const nodeRss = process.memoryUsage().rss / (1024 * 1024);
        if (nodeRss > peakRss) peakRss = nodeRss;

        const browserRss = getBrowserRssMb(pid);
        if (browserRss !== null && browserRss > (result.peakBrowserRssMb ?? 0)) {
          result.peakBrowserRssMb = browserRss;
        }

        // Save PNG from last run
        if (i === BENCHMARK_RUNS - 1) {
          const outDir = resolve(__dirname, 'output', engine.name);
          mkdirSync(outDir, { recursive: true });
          const outPath = resolve(outDir, `${comp.name}.png`);
          writeFileSync(outPath, r.png);
          console.log(`    Saved: output/${engine.name}/${comp.name}.png`);
        }
      }

      if (peakRss > result.peakNodeRssMb) result.peakNodeRssMb = peakRss;

      const sorted = [...renderTimes].sort((a, b) => a - b);
      compResult.warmRenderP50Ms = Math.round(percentile(sorted, 50));
      compResult.warmRenderP95Ms = Math.round(percentile(sorted, 95));
      compResult.warmRenderMaxMs = Math.round(Math.max(...renderTimes));
      compResult.renderTimesMs = renderTimes;

      console.log(
        `    p50=${compResult.warmRenderP50Ms}ms p95=${compResult.warmRenderP95Ms}ms max=${compResult.warmRenderMaxMs}ms`,
      );
    } catch (err) {
      compResult.error = String(err);
      console.error(`    Error: ${err}`);
    }

    result.compositions.push(compResult);
  }

  await engine.close();
  return result;
}

function printTable(results: EngineResult[]): void {
  const engineNames = results.map((r) => r.engine);
  const colW = 12;
  const labelW = 24;

  const pad = (s: string | number, w: number) => String(s).padEnd(w);
  const rpad = (s: string | number, w: number) => String(s).padStart(w);

  const hr = '-'.repeat(labelW + 1 + engineNames.length * (colW + 1));
  console.log('\n' + '='.repeat(hr.length));
  console.log('BENCHMARK RESULTS');
  console.log('='.repeat(hr.length));

  const header =
    pad('Metric', labelW) +
    ' ' +
    engineNames.map((n) => rpad(n, colW)).join(' ');
  console.log(header);
  console.log(hr);

  const cell = (r: EngineResult, fn: (r: EngineResult) => string | number) => {
    if (r.error) return rpad('ERROR', colW);
    return rpad(fn(r), colW);
  };

  const compCell = (
    r: EngineResult,
    compName: string,
    fn: (c: CompositionResult) => string | number,
  ) => {
    if (r.error) return rpad('ERROR', colW);
    const c = r.compositions.find((c) => c.name === compName);
    if (!c) return rpad('N/A', colW);
    if (c.error) return rpad('ERROR', colW);
    return rpad(fn(c), colW);
  };

  // Cold start
  console.log(
    pad('Cold start (ms)', labelW) +
      ' ' +
      results
        .map((r) => cell(r, (r) => (r.coldStartMs ? `${r.coldStartMs.toFixed(0)}ms` : 'N/A')))
        .join(' '),
  );

  // Per-composition render times
  for (const comp of COMPOSITIONS) {
    console.log(hr);
    console.log(`  [${comp.name}]`);
    console.log(
      pad('  Warm render p50', labelW) +
        ' ' +
        results
          .map((r) =>
            compCell(
              r,
              comp.name,
              (c) => (c.warmRenderP50Ms !== null ? `${c.warmRenderP50Ms}ms` : 'N/A'),
            ),
          )
          .join(' '),
    );
    console.log(
      pad('  Warm render p95', labelW) +
        ' ' +
        results
          .map((r) =>
            compCell(
              r,
              comp.name,
              (c) => (c.warmRenderP95Ms !== null ? `${c.warmRenderP95Ms}ms` : 'N/A'),
            ),
          )
          .join(' '),
    );
    console.log(
      pad('  Warm render max', labelW) +
        ' ' +
        results
          .map((r) =>
            compCell(
              r,
              comp.name,
              (c) => (c.warmRenderMaxMs !== null ? `${c.warmRenderMaxMs}ms` : 'N/A'),
            ),
          )
          .join(' '),
    );
  }

  console.log(hr);
  console.log(
    pad('Browser RSS (peak)', labelW) +
      ' ' +
      results
        .map((r) =>
          cell(r, (r) => (r.peakBrowserRssMb !== null ? `${r.peakBrowserRssMb}MB` : 'N/A')),
        )
        .join(' '),
  );
  console.log(
    pad('Node RSS (peak)', labelW) +
      ' ' +
      results.map((r) => cell(r, (r) => `${Math.round(r.peakNodeRssMb)}MB`)).join(' '),
  );
  console.log(
    pad('Disk footprint', labelW) +
      ' ' +
      results.map((r) => rpad(r.diskFootprint, colW)).join(' '),
  );
  console.log('='.repeat(hr.length));
}

async function main() {
  console.log('Grafex Engine Benchmark');
  console.log(`Warmup runs: ${WARMUP_RUNS} | Benchmark runs: ${BENCHMARK_RUNS}`);

  const engines: BrowserEngine[] = [
    new PlaywrightEngine('chromium'),
    new PlaywrightEngine('webkit'),
    new PlaywrightEngine('firefox'),
    new SparticuzEngine(),
  ];

  const allResults: EngineResult[] = [];

  for (const engine of engines) {
    try {
      const result = await benchmarkEngine(engine);
      allResults.push(result);
    } catch (err) {
      console.error(`Unexpected error for engine ${engine.name}: ${err}`);
      allResults.push({
        engine: engine.name,
        coldStartMs: null,
        error: String(err),
        compositions: [],
        diskFootprint: 'N/A',
        peakBrowserRssMb: null,
        peakNodeRssMb: 0,
      });
    }
  }

  printTable(allResults);

  // Save results
  const resultsDir = resolve(__dirname, 'results');
  mkdirSync(resultsDir, { recursive: true });

  for (const r of allResults) {
    writeFileSync(
      resolve(resultsDir, `${r.engine}.json`),
      JSON.stringify(r, null, 2),
    );
  }

  writeFileSync(
    resolve(resultsDir, 'comparison.json'),
    JSON.stringify(allResults, null, 2),
  );

  console.log('\nResults saved to results/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
