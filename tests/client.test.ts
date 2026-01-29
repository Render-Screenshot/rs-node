import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '../src/client.js';
import { TakeOptions } from '../src/options.js';
import { RenderScreenshotError } from '../src/errors.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('creates client with API key', () => {
      const client = new Client('rs_live_test123');
      expect(client.getApiKey()).toBe('rs_live_test123');
    });

    it('throws error for empty API key', () => {
      expect(() => new Client('')).toThrow('API key is required');
    });

    it('uses default base URL', () => {
      const client = new Client('rs_live_test123');
      expect(client.getBaseUrl()).toBe('https://api.renderscreenshot.com');
    });

    it('accepts custom base URL', () => {
      const client = new Client('rs_live_test123', {
        baseUrl: 'https://custom.api.com',
      });
      expect(client.getBaseUrl()).toBe('https://custom.api.com');
    });

    it('uses default timeout', () => {
      const client = new Client('rs_live_test123');
      expect(client.getTimeout()).toBe(30000);
    });

    it('accepts custom timeout', () => {
      const client = new Client('rs_live_test123', {
        timeout: 60000,
      });
      expect(client.getTimeout()).toBe(60000);
    });

    it('has cache manager attached', () => {
      const client = new Client('rs_live_test123');
      expect(client.cache).toBeDefined();
    });
  });

  describe('take', () => {
    it('makes POST request with options', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(imageBuffer.buffer),
      });

      const client = new Client('rs_live_test123');
      const result = await client.take(TakeOptions.url('https://example.com').preset('og_card'));

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];

      expect(url).toBe('https://api.renderscreenshot.com/v1/screenshot');
      expect(options.method).toBe('POST');
      expect(options.headers).toMatchObject({
        Authorization: 'Bearer rs_live_test123',
        'Content-Type': 'application/json',
      });

      const body = JSON.parse(options.body as string);
      expect(body.url).toBe('https://example.com');
      expect(body.preset).toBe('og_card');

      expect(result).toBeInstanceOf(Buffer);
    });

    it('accepts config object instead of TakeOptions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(Buffer.from('image').buffer),
      });

      const client = new Client('rs_live_test123');
      await client.take({ url: 'https://example.com', width: 1200 });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);
      expect(body.url).toBe('https://example.com');
      expect(body.viewport).toEqual({ width: 1200 });
    });
  });

  describe('takeJson', () => {
    it('makes POST request and returns JSON response', async () => {
      const response = {
        url: 'https://cdn.renderscreenshot.com/abc.png',
        cacheUrl: 'https://cdn.renderscreenshot.com/abc.png',
        width: 1200,
        height: 630,
        format: 'png',
        size: 123456,
        cached: false,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response),
      });

      const client = new Client('rs_live_test123');
      const result = await client.takeJson(
        TakeOptions.url('https://example.com').preset('og_card')
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);
      expect(body.response_type).toBe('json');

      expect(result.url).toBe('https://cdn.renderscreenshot.com/abc.png');
      expect(result.width).toBe(1200);
      expect(result.height).toBe(630);
    });
  });

  describe('generateUrl', () => {
    it('generates signed URL with options', () => {
      const client = new Client('rs_live_test123');
      const expiresAt = new Date('2024-01-20T00:00:00Z');

      const url = client.generateUrl(
        TakeOptions.url('https://example.com').width(1200).height(630),
        expiresAt
      );

      expect(url).toContain('https://api.renderscreenshot.com/v1/screenshot?');
      expect(url).toContain('url=https://example.com');
      expect(url).toContain('width=1200');
      expect(url).toContain('height=630');
      expect(url).toContain('expires=1705708800');
      expect(url).toContain('signature=');
    });

    it('generates consistent signatures for same params', () => {
      const client = new Client('rs_live_test123');
      const expiresAt = new Date('2024-01-20T00:00:00Z');
      const options = TakeOptions.url('https://example.com').preset('og_card');

      const url1 = client.generateUrl(options, expiresAt);
      const url2 = client.generateUrl(options, expiresAt);

      expect(url1).toBe(url2);
    });

    it('generates different signatures for different params', () => {
      const client = new Client('rs_live_test123');
      const expiresAt = new Date('2024-01-20T00:00:00Z');

      const url1 = client.generateUrl(TakeOptions.url('https://example1.com'), expiresAt);
      const url2 = client.generateUrl(TakeOptions.url('https://example2.com'), expiresAt);

      expect(url1).not.toBe(url2);
    });

    it('accepts config object instead of TakeOptions', () => {
      const client = new Client('rs_live_test123');
      const expiresAt = new Date('2024-01-20T00:00:00Z');

      const url = client.generateUrl({ url: 'https://example.com', width: 1200 }, expiresAt);

      expect(url).toContain('url=https://example.com');
      expect(url).toContain('width=1200');
    });
  });

  describe('batch', () => {
    it('makes batch request with URLs array', async () => {
      const response = {
        id: 'batch_abc123',
        status: 'completed',
        total: 2,
        completed: 2,
        failed: 0,
        results: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response),
      });

      const client = new Client('rs_live_test123');
      const result = await client.batch(
        ['https://example1.com', 'https://example2.com'],
        TakeOptions.url('').preset('og_card')
      );

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/batch');

      const body = JSON.parse(options.body as string);
      expect(body.urls).toEqual(['https://example1.com', 'https://example2.com']);
      expect(body.options.preset).toBe('og_card');

      expect(result.id).toBe('batch_abc123');
    });

    it('makes batch request with request items', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'batch_abc123',
            status: 'completed',
            results: [],
          }),
      });

      const client = new Client('rs_live_test123');
      await client.batch([
        { url: 'https://example1.com', options: { width: 1200 } },
        { url: 'https://example2.com', options: { preset: 'full_page' } },
      ]);

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);

      expect(body.requests).toHaveLength(2);
      expect(body.requests[0].url).toBe('https://example1.com');
      expect(body.requests[1].url).toBe('https://example2.com');
    });
  });

  describe('getBatch', () => {
    it('fetches batch status', async () => {
      const response = {
        id: 'batch_abc123',
        status: 'processing',
        total: 10,
        completed: 5,
        failed: 0,
        results: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response),
      });

      const client = new Client('rs_live_test123');
      const result = await client.getBatch('batch_abc123');

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/batch/batch_abc123');
      expect(result.status).toBe('processing');
    });
  });

  describe('presets', () => {
    it('fetches all presets', async () => {
      const presets = [
        { id: 'og_card', name: 'OG Card', width: 1200, height: 630 },
        { id: 'twitter_card', name: 'Twitter Card', width: 1200, height: 675 },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(presets),
      });

      const client = new Client('rs_live_test123');
      const result = await client.presets();

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/presets');
      expect(result).toHaveLength(2);
    });
  });

  describe('preset', () => {
    it('fetches single preset', async () => {
      const preset = { id: 'og_card', name: 'OG Card', width: 1200, height: 630 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(preset),
      });

      const client = new Client('rs_live_test123');
      const result = await client.preset('og_card');

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/presets/og_card');
      expect(result.id).toBe('og_card');
    });
  });

  describe('devices', () => {
    it('fetches all devices', async () => {
      const devices = [{ id: 'iphone_14_pro', name: 'iPhone 14 Pro', width: 393, height: 852 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(devices),
      });

      const client = new Client('rs_live_test123');
      const result = await client.devices();

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/devices');
      expect(result).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('throws RenderScreenshotError for API errors', async () => {
      const errorHeaders = new Headers({ 'content-type': 'application/json' });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: errorHeaders,
        json: () =>
          Promise.resolve({
            code: 'invalid_url',
            message: 'The URL provided is not valid',
          }),
      });

      const client = new Client('rs_live_test123');

      try {
        await client.take(TakeOptions.url('not-a-url'));
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RenderScreenshotError);
        if (error instanceof RenderScreenshotError) {
          expect(error.httpStatus).toBe(400);
          expect(error.code).toBe('invalid_url');
        }
      }
    });

    it('handles rate limit with retry-after header', async () => {
      const errorHeaders = new Headers({
        'content-type': 'application/json',
        'retry-after': '60',
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: errorHeaders,
        json: () =>
          Promise.resolve({
            code: 'rate_limited',
            message: 'Rate limit exceeded',
          }),
      });

      const client = new Client('rs_live_test123');

      try {
        await client.take(TakeOptions.url('https://example.com'));
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RenderScreenshotError);
        if (error instanceof RenderScreenshotError) {
          expect(error.httpStatus).toBe(429);
          expect(error.retryAfter).toBe(60);
          expect(error.retryable).toBe(true);
        }
      }
    });

    it('handles timeout', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      const client = new Client('rs_live_test123');

      try {
        await client.take(TakeOptions.url('https://example.com'));
      } catch (error) {
        expect(error).toBeInstanceOf(RenderScreenshotError);
        if (error instanceof RenderScreenshotError) {
          expect(error.code).toBe('timeout');
          expect(error.retryable).toBe(true);
        }
      }
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const client = new Client('rs_live_test123');

      try {
        await client.take(TakeOptions.url('https://example.com'));
      } catch (error) {
        expect(error).toBeInstanceOf(RenderScreenshotError);
        if (error instanceof RenderScreenshotError) {
          expect(error.code).toBe('internal_error');
          expect(error.message).toContain('Network error');
        }
      }
    });
  });
});
