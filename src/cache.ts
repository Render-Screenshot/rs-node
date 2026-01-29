import type { PurgeResult } from './types.js';

/**
 * Interface for the Client to avoid circular dependency
 */
interface ClientInterface {
  request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
      responseType?: 'json' | 'buffer';
    }
  ): Promise<T>;
}

/**
 * Cache management methods for RenderScreenshot
 */
export class CacheManager {
  private readonly client: ClientInterface;

  constructor(client: ClientInterface) {
    this.client = client;
  }

  /**
   * Get a cached screenshot by its cache key
   *
   * @param key - The cache key returned in X-Cache-Key header
   * @returns Buffer containing the screenshot, or null if not found
   *
   * @example
   * ```typescript
   * const image = await client.cache.get('cache_xyz789');
   * if (image) {
   *   await fs.writeFile('cached.png', image);
   * }
   * ```
   */
  async get(key: string): Promise<Buffer | null> {
    try {
      return await this.client.request<Buffer>('GET', `/cache/${key}`, {
        responseType: 'buffer',
      });
    } catch (error) {
      // Return null for 404 errors
      if (
        error !== null &&
        typeof error === 'object' &&
        'httpStatus' in error &&
        error.httpStatus === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a single cache entry
   *
   * @param key - The cache key to delete
   * @returns true if deleted, false if not found
   *
   * @example
   * ```typescript
   * const deleted = await client.cache.delete('cache_xyz789');
   * ```
   */
  async delete(key: string): Promise<boolean> {
    interface DeleteResponse {
      deleted: boolean;
    }
    const response = await this.client.request<DeleteResponse>('DELETE', `/cache/${key}`);
    return response.deleted;
  }

  /**
   * Bulk purge cache entries by keys
   *
   * @param keys - Array of cache keys to purge
   * @returns Purge result with count and keys
   *
   * @example
   * ```typescript
   * const result = await client.cache.purge(['cache_abc', 'cache_def']);
   * console.log(`Purged ${result.purged} entries`);
   * ```
   */
  async purge(keys: string[]): Promise<PurgeResult> {
    return this.client.request<PurgeResult>('POST', '/cache/purge', {
      body: { keys },
    });
  }

  /**
   * Purge cache entries matching a URL pattern
   *
   * @param pattern - Glob pattern to match source URLs (e.g., "https://mysite.com/*")
   * @returns Purge result with count
   *
   * @example
   * ```typescript
   * const result = await client.cache.purgeUrl('https://mysite.com/blog/*');
   * ```
   */
  async purgeUrl(pattern: string): Promise<PurgeResult> {
    return this.client.request<PurgeResult>('POST', '/cache/purge', {
      body: { url: pattern },
    });
  }

  /**
   * Purge cache entries created before a specific date
   *
   * @param date - Purge entries created before this date
   * @returns Purge result with count
   *
   * @example
   * ```typescript
   * const result = await client.cache.purgeBefore(new Date('2024-01-01'));
   * ```
   */
  async purgeBefore(date: Date): Promise<PurgeResult> {
    return this.client.request<PurgeResult>('POST', '/cache/purge', {
      body: { before: date.toISOString() },
    });
  }

  /**
   * Purge cache entries matching a storage path pattern
   *
   * @param pattern - Glob pattern for storage paths (e.g., "screenshots/2024/01/*")
   * @returns Purge result with count
   *
   * @example
   * ```typescript
   * const result = await client.cache.purgePattern('screenshots/2024/*');
   * ```
   */
  async purgePattern(pattern: string): Promise<PurgeResult> {
    return this.client.request<PurgeResult>('POST', '/cache/purge', {
      body: { pattern },
    });
  }
}
