import { describe, test, expect, vi, beforeEach } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

function makeMockManager() {
  const render = vi.fn().mockResolvedValue(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]));
  const close = vi.fn().mockResolvedValue(undefined);
  return { render, close };
}

describe('types.ts', () => {
  test('module loads without error (exports RenderOptions, RenderResult, CompositionConfig)', async () => {
    const types = await import('../../src/types.js');
    expect(types).toBeDefined();
  });
});

describe('render.ts — browserManager singleton', () => {
  test('browserManager is exported', async () => {
    const render = await import('../../src/render.js');
    expect(render.browserManager).toBeDefined();
  });

  test('browserManager is a BrowserManager instance', async () => {
    const { browserManager } = await import('../../src/render.js');
    const { BrowserManager } = await import('../../src/browser.js');
    expect(browserManager).toBeInstanceOf(BrowserManager);
  });
});

describe('pipeline() — result shape', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('returns object with buffer, width, height, format', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    expect(result).toHaveProperty('buffer');
    expect(result).toHaveProperty('width');
    expect(result).toHaveProperty('height');
    expect(result).toHaveProperty('format');
  });

  test('returned format is "png"', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    expect(result.format).toBe('png');
  });

  test('returned buffer is a Buffer instance', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
  });
});

describe('pipeline() — dimensions', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('uses default dimensions 1200x630 when composition has no config', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(resolve(fixturesDir, 'no-config.tsx'), {}, mockManager as any);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      { width: 1200, height: 630 },
      1,
      'png',
      undefined,
    );
  });

  test('uses config dimensions from composition', async () => {
    const { pipeline } = await import('../../src/render.js');
    // simple.tsx has config: width 800, height 400
    const result = await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    expect(result.width).toBe(800);
    expect(result.height).toBe(400);
  });

  test('options.width overrides mod.config.width', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { width: 500 },
      mockManager as any,
    );
    expect(result.width).toBe(500);
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ width: 500 }),
      1,
      'png',
      undefined,
    );
  });

  test('options.height overrides mod.config.height', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { height: 250 },
      mockManager as any,
    );
    expect(result.height).toBe(250);
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ height: 250 }),
      1,
      'png',
      undefined,
    );
  });

  test('returned width/height match effective dimensions (after overrides)', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { width: 1000, height: 500 },
      mockManager as any,
    );
    expect(result.width).toBe(1000);
    expect(result.height).toBe(500);
  });
});

describe('pipeline() — props passing', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('options.props is passed to the composition default export', async () => {
    const { pipeline } = await import('../../src/render.js');
    // with-props.tsx renders a title prop — it should not throw
    const result = await pipeline(
      resolve(fixturesDir, 'with-props.tsx'),
      { props: { title: 'Test Title' } },
      mockManager as any,
    );
    expect(result).toBeDefined();
    expect(result.format).toBe('png');
  });
});

describe('pipeline() — HTML passed to browser', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('passes full HTML document to browserManager.render', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    expect(mockManager.render).toHaveBeenCalledOnce();
    const [html] = mockManager.render.mock.calls[0] as [string, unknown];
    expect(html).toContain('<!DOCTYPE html>');
  });
});

describe('pipeline() — path resolution', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('resolves relative compositionPath against cwd', async () => {
    const { pipeline } = await import('../../src/render.js');
    const originalCwd = process.cwd();
    process.chdir(resolve(fixturesDir, '../..'));
    try {
      const result = await pipeline('test/fixtures/simple.tsx', {}, mockManager as any);
      expect(result).toBeDefined();
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('accepts absolute compositionPath', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    expect(result).toBeDefined();
  });
});

describe('pipeline() — import cache (nonce)', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('calling pipeline() twice with the same fixture both succeed', async () => {
    const { pipeline } = await import('../../src/render.js');
    const fixturePath = resolve(fixturesDir, 'simple.tsx');
    const first = await pipeline(fixturePath, {}, mockManager as any);
    const second = await pipeline(fixturePath, {}, mockManager as any);
    expect(first.format).toBe('png');
    expect(second.format).toBe('png');
    expect(mockManager.render).toHaveBeenCalledTimes(2);
  });
});

describe('pipeline() — fonts passthrough', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('config.fonts are present in the HTML passed to the browser', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'with-fonts.tsx'), {}, mockManager as any);
    const [html] = mockManager.render.mock.calls[0] as [string, unknown];
    expect(html).toContain('<link rel="stylesheet"');
    expect(html).toContain('fonts.googleapis.com');
  });

  test('composition without fonts config produces no link tags', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    const [html] = mockManager.render.mock.calls[0] as [string, unknown];
    expect(html).not.toContain('<link rel="stylesheet"');
  });
});

describe('pipeline() — scale', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('default scale is 1 when neither options nor config specifies scale', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(resolve(fixturesDir, 'no-config.tsx'), {}, mockManager as any);
    expect(result.scale).toBe(1);
  });

  test('result.scale reflects options.scale', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { scale: 2 },
      mockManager as any,
    );
    expect(result.scale).toBe(2);
  });

  test('result.width and result.height are physical pixels (CSS * scale)', async () => {
    const { pipeline } = await import('../../src/render.js');
    // simple.tsx config: width 800, height 400
    const result = await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { scale: 2 },
      mockManager as any,
    );
    expect(result.width).toBe(1600);
    expect(result.height).toBe(800);
  });

  test('scale is passed as third argument to manager.render', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'simple.tsx'), { scale: 2 }, mockManager as any);
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      2,
      'png',
      undefined,
    );
  });

  test('options.scale overrides config.scale', async () => {
    const { pipeline } = await import('../../src/render.js');
    // with-scale.tsx exports config.scale = 2; options.scale = 3 should win
    const result = await pipeline(
      resolve(fixturesDir, 'with-scale.tsx'),
      { scale: 3 },
      mockManager as any,
    );
    expect(result.scale).toBe(3);
  });

  test('config.scale is used when options.scale is not set', async () => {
    const { pipeline } = await import('../../src/render.js');
    // with-scale.tsx exports config.scale = 2
    const result = await pipeline(resolve(fixturesDir, 'with-scale.tsx'), {}, mockManager as any);
    expect(result.scale).toBe(2);
  });

  test('fractional scale 1.5 is accepted and propagated', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { scale: 1.5 },
      mockManager as any,
    );
    expect(result.scale).toBe(1.5);
    expect(result.width).toBe(800 * 1.5);
    expect(result.height).toBe(400 * 1.5);
  });
});

describe('pipeline() — css passthrough', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('config.css contents are present as style tags in the HTML passed to the browser', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'with-css.tsx'), {}, mockManager as any);
    const [html] = mockManager.render.mock.calls[0] as [string, unknown];
    expect(html).toContain('<style>');
    expect(html).toContain('.grafex-test');
  });

  test('missing css file throws descriptive error with path', async () => {
    const { pipeline } = await import('../../src/render.js');
    await expect(
      pipeline(resolve(fixturesDir, 'with-missing-css.tsx'), {}, mockManager as any),
    ).rejects.toThrow('with-missing-css.tsx');
  });

  test('composition without css config produces only reset style tag', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    const [html] = mockManager.render.mock.calls[0] as [string, unknown];
    const styleCount = (html.match(/<style>/g) ?? []).length;
    expect(styleCount).toBe(1);
  });
});

describe('pipeline() — with-components fixture', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('renders with-components.tsx without throwing', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(
      resolve(fixturesDir, 'with-components.tsx'),
      {},
      mockManager as any,
    );
    expect(result).toBeDefined();
    expect(result.format).toBe('png');
  });
});

describe('pipeline() — format resolution', () => {
  let mockManager: ReturnType<typeof makeMockManager>;

  beforeEach(() => {
    mockManager = makeMockManager();
  });

  test('defaults to format "png" when no format is specified', async () => {
    const { pipeline } = await import('../../src/render.js');
    const result = await pipeline(resolve(fixturesDir, 'no-config.tsx'), {}, mockManager as any);
    expect(result.format).toBe('png');
  });

  test('uses config.format when options.format is not set', async () => {
    const { pipeline } = await import('../../src/render.js');
    // with-jpeg.tsx exports config.format = 'jpeg'
    const result = await pipeline(resolve(fixturesDir, 'with-jpeg.tsx'), {}, mockManager as any);
    expect(result.format).toBe('jpeg');
  });

  test('options.format overrides config.format', async () => {
    const { pipeline } = await import('../../src/render.js');
    // with-jpeg.tsx exports config.format = 'jpeg'; options.format = 'png' should win
    const result = await pipeline(
      resolve(fixturesDir, 'with-jpeg.tsx'),
      { format: 'png' },
      mockManager as any,
    );
    expect(result.format).toBe('png');
  });

  test('format and quality are passed to manager.render for jpeg', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'with-jpeg.tsx'), {}, mockManager as any);
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(Number),
      'jpeg',
      90,
    );
  });

  test('resolves default quality 90 for jpeg when no quality specified', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'simple.tsx'), { format: 'jpeg' }, mockManager as any);
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(Number),
      'jpeg',
      90,
    );
  });

  test('passes custom quality through for jpeg', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { format: 'jpeg', quality: 50 },
      mockManager as any,
    );
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(Number),
      'jpeg',
      50,
    );
  });

  test('quality is undefined for png', async () => {
    const { pipeline } = await import('../../src/render.js');
    await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, mockManager as any);
    expect(mockManager.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(Number),
      'png',
      undefined,
    );
  });
});
