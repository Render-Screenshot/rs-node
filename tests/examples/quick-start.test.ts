/**
 * Tests that mirror the documentation quick-start examples
 * These tests ensure documentation code snippets work correctly
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client, TakeOptions } from '../../src/index.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Quick Start Examples', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Basic screenshot - docs example', async () => {
    // From: docs/getting-started/quick-start.html.markerb
    //
    // const client = new Client('rs_live_xxxxx');
    // const image = await client.take(
    //   TakeOptions.url('https://example.com').preset('og_card')
    // );

    const imageData = new TextEncoder().encode('fake-png-data');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: () => Promise.resolve(imageData.buffer),
    });

    const client = new Client('rs_live_xxxxx');
    const image = await client.take(TakeOptions.url('https://example.com').preset('og_card'));

    expect(image).toBeInstanceOf(Buffer);

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.renderscreenshot.com/v1/screenshot');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body as string);
    expect(body.url).toBe('https://example.com');
    expect(body.preset).toBe('og_card');
  });

  it('Screenshot with options - docs example', async () => {
    // From: docs/getting-started/quick-start.html.markerb
    //
    // const image = await client.take(
    //   TakeOptions.url('https://example.com')
    //     .width(1200)
    //     .height(630)
    //     .format('png')
    //     .blockAds()
    // );

    const imageData = new TextEncoder().encode('fake-png-data');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: () => Promise.resolve(imageData.buffer),
    });

    const client = new Client('rs_live_xxxxx');
    const image = await client.take(
      TakeOptions.url('https://example.com').width(1200).height(630).format('png').blockAds()
    );

    expect(image).toBeInstanceOf(Buffer);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(body.url).toBe('https://example.com');
    expect(body.viewport.width).toBe(1200);
    expect(body.viewport.height).toBe(630);
    expect(body.format).toBe('png');
    expect(body.block_ads).toBe(true);
  });

  it('JSON response - docs example', async () => {
    // From: docs/getting-started/quick-start.html.markerb
    //
    // const response = await client.takeJson(
    //   TakeOptions.url('https://example.com').preset('og_card')
    // );
    // console.log(response.url);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          url: 'https://cdn.renderscreenshot.com/screenshots/abc123.png',
          width: 1200,
          height: 630,
          format: 'png',
          size: 123456,
          cached: false,
        }),
    });

    const client = new Client('rs_live_xxxxx');
    const response = await client.takeJson(
      TakeOptions.url('https://example.com').preset('og_card')
    );

    expect(response.url).toBe('https://cdn.renderscreenshot.com/screenshots/abc123.png');
    expect(response.width).toBe(1200);
    expect(response.height).toBe(630);
  });

  it('Signed URL generation - docs example', () => {
    // From: docs/authentication/signed-urls.html.markerb
    //
    // const url = client.generateUrl(
    //   TakeOptions.url('https://example.com').preset('og_card'),
    //   new Date(Date.now() + 24 * 60 * 60 * 1000)
    // );

    const client = new Client('rs_live_xxxxx');
    const expiresAt = new Date('2025-01-30T00:00:00Z');

    const url = client.generateUrl(
      TakeOptions.url('https://example.com').preset('og_card'),
      expiresAt
    );

    expect(url).toContain('https://api.renderscreenshot.com/v1/screenshot?');
    expect(url).toContain('url=https://example.com');
    expect(url).toContain('preset=og_card');
    expect(url).toContain('expires=');
    expect(url).toContain('signature=');
  });
});
