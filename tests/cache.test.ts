import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '../src/client.js';
import { RenderScreenshotError } from '../src/errors.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('CacheManager', () => {
  let client: Client;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new Client('rs_live_test123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('retrieves cached screenshot', async () => {
      const imageData = 'cached-image-data';
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(imageData);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(uint8Array.buffer),
      });

      const result = await client.cache.get('cache_xyz789');

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/cache/cache_xyz789');
      expect(options.method).toBe('GET');
      expect(result).toBeInstanceOf(Buffer);
      expect(result?.toString()).toBe('cached-image-data');
    });

    it('returns null for non-existent cache key', async () => {
      const error = new RenderScreenshotError(404, 'not_found', 'Cache entry not found');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: () =>
          Promise.resolve({
            code: 'not_found',
            message: 'Cache entry not found',
          }),
      });

      // Mock the request method to throw the error
      vi.spyOn(client, 'request').mockRejectedValueOnce(error);

      const result = await client.cache.get('nonexistent_key');

      expect(result).toBeNull();
    });

    it('throws error for other HTTP errors', async () => {
      const error = new RenderScreenshotError(500, 'internal_error', 'Server error');
      vi.spyOn(client, 'request').mockRejectedValueOnce(error);

      await expect(client.cache.get('cache_xyz789')).rejects.toThrow(RenderScreenshotError);
    });
  });

  describe('delete', () => {
    it('deletes cache entry', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: true, key: 'cache_xyz789' }),
      });

      const result = await client.cache.delete('cache_xyz789');

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/cache/cache_xyz789');
      expect(options.method).toBe('DELETE');
      expect(result).toBe(true);
    });

    it('returns false when entry not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: false, key: 'cache_xyz789' }),
      });

      const result = await client.cache.delete('cache_xyz789');

      expect(result).toBe(false);
    });
  });

  describe('purge', () => {
    it('purges multiple keys', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            purged: 2,
            keys: ['cache_abc', 'cache_def'],
          }),
      });

      const result = await client.cache.purge(['cache_abc', 'cache_def']);

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/cache/purge');
      expect(options.method).toBe('POST');

      const body = JSON.parse(options.body as string);
      expect(body.keys).toEqual(['cache_abc', 'cache_def']);

      expect(result.purged).toBe(2);
      expect(result.keys).toEqual(['cache_abc', 'cache_def']);
    });
  });

  describe('purgeUrl', () => {
    it('purges by URL pattern', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            purged: 15,
            keys: [],
          }),
      });

      const result = await client.cache.purgeUrl('https://mysite.com/blog/*');

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/cache/purge');

      const body = JSON.parse(options.body as string);
      expect(body.url).toBe('https://mysite.com/blog/*');

      expect(result.purged).toBe(15);
    });
  });

  describe('purgeBefore', () => {
    it('purges entries before date', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            purged: 100,
            keys: [],
          }),
      });

      const date = new Date('2024-01-01T00:00:00Z');
      const result = await client.cache.purgeBefore(date);

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/cache/purge');

      const body = JSON.parse(options.body as string);
      expect(body.before).toBe('2024-01-01T00:00:00.000Z');

      expect(result.purged).toBe(100);
    });
  });

  describe('purgePattern', () => {
    it('purges by storage path pattern', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            purged: 50,
            keys: [],
          }),
      });

      const result = await client.cache.purgePattern('screenshots/2024/01/*');

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.renderscreenshot.com/v1/cache/purge');

      const body = JSON.parse(options.body as string);
      expect(body.pattern).toBe('screenshots/2024/01/*');

      expect(result.purged).toBe(50);
    });
  });
});
