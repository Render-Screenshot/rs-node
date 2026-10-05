/**
 * Tests that mirror the batch documentation examples
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client, TakeOptions } from '../../src/index.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Batch Examples', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Simple batch with URLs array - docs example', async () => {
    // From: docs/endpoints/batch.html.markerb
    //
    // const results = await client.batch(
    //   ['https://example1.com', 'https://example2.com'],
    //   TakeOptions.url('').preset('og_card')
    // );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'batch_abc123',
          status: 'completed',
          total: 2,
          completed: 2,
          failed: 0,
          results: [
            {
              position: 0,
              url: 'https://example1.com',
              status: 'completed',
              image: { image_url: 'https://cdn.renderscreenshot.com/a.png' },
              error: null,
            },
            {
              position: 1,
              url: 'https://example2.com',
              status: 'completed',
              image: { image_url: 'https://cdn.renderscreenshot.com/b.png' },
              error: null,
            },
          ],
        }),
    });

    const client = new Client('rs_live_xxxxx');
    const results = await client.batch(
      ['https://example1.com', 'https://example2.com'],
      TakeOptions.url('').preset('og_card')
    );

    expect(results.status).toBe('completed');
    expect(results.total).toBe(2);
    expect(results.completed).toBe(2);
    expect(results.results).toHaveLength(2);

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.renderscreenshot.com/v1/batch');

    const body = JSON.parse(options.body as string);
    expect(body.urls).toEqual(['https://example1.com', 'https://example2.com']);
    expect(body.options.preset).toBe('og_card');
  });

  it('Advanced batch with per-URL options - docs example', async () => {
    // From: docs/endpoints/batch.html.markerb
    //
    // const results = await client.batch([
    //   { url: 'https://example1.com', options: { width: 1200 } },
    //   { url: 'https://example2.com', options: { preset: 'full_page' } },
    // ]);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'batch_def456',
          status: 'completed',
          total: 2,
          completed: 2,
          failed: 0,
          results: [],
        }),
    });

    const client = new Client('rs_live_xxxxx');
    const results = await client.batch([
      { url: 'https://example1.com', options: { width: 1200 } },
      { url: 'https://example2.com', options: { preset: 'full_page' } },
    ]);

    expect(results.status).toBe('completed');

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(body.requests).toHaveLength(2);
    expect(body.requests[0].url).toBe('https://example1.com');
    expect(body.requests[0].viewport.width).toBe(1200);
    expect(body.requests[1].url).toBe('https://example2.com');
    expect(body.requests[1].preset).toBe('full_page');
  });

  it('Get batch status - docs example', async () => {
    // From: docs/endpoints/batch.html.markerb
    //
    // const status = await client.getBatch('batch_abc123');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'batch_abc123',
          status: 'processing',
          total: 10,
          completed: 5,
          failed: 0,
          results: [],
        }),
    });

    const client = new Client('rs_live_xxxxx');
    const status = await client.getBatch('batch_abc123');

    expect(status.id).toBe('batch_abc123');
    expect(status.status).toBe('processing');
    expect(status.total).toBe(10);
    expect(status.completed).toBe(5);
  });

  it('Reads completed and failed items - docs example', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'batch_abc123',
          status: 'completed',
          total: 2,
          completed: 1,
          failed: 1,
          results: [
            {
              position: 0,
              url: 'https://github.com',
              status: 'completed',
              image: {
                image_url: 'https://cdn.renderscreenshot.com/a.png',
                width: 1200,
                height: 630,
              },
              error: null,
            },
            {
              position: 1,
              url: 'https://broken.example',
              status: 'failed',
              image: null,
              error: 'Page failed to load within 30 seconds',
            },
          ],
          usage: { credits: 1, remaining: 99 },
        }),
    });

    const client = new Client('rs_live_xxxxx');
    const results = await client.batch(['https://github.com', 'https://broken.example']);

    const urls = (results.results ?? []).map((item) =>
      item.status === 'completed' ? item.image?.image_url : 'failed'
    );

    expect(urls).toEqual(['https://cdn.renderscreenshot.com/a.png', 'failed']);
    expect(results.results?.[1]?.error).toBe('Page failed to load within 30 seconds');
    expect(results.completed).toBe(1);
    expect(results.failed).toBe(1);
  });
});
