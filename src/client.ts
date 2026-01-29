import { createHmac } from 'node:crypto';
import type {
  ClientOptions,
  ScreenshotResponse,
  BatchResponse,
  BatchRequestItem,
  PresetInfo,
  DeviceInfo,
  TakeOptionsConfig,
} from './types.js';
import { RenderScreenshotError } from './errors.js';
import { TakeOptions } from './options.js';
import { CacheManager } from './cache.js';

const DEFAULT_BASE_URL = 'https://api.renderscreenshot.com';
const DEFAULT_TIMEOUT = 30000;
const API_VERSION = 'v1';

/**
 * Parse a response body from the API
 */
async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

/**
 * Handle API errors and convert to RenderScreenshotError
 */
async function handleApiError(response: Response): Promise<never> {
  const retryAfterHeader = response.headers.get('retry-after');
  const retryAfter = retryAfterHeader !== null ? parseInt(retryAfterHeader, 10) : undefined;

  const body = await parseResponseBody(response);
  const errorBody =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};

  const errorParams: { code?: string; message?: string; error?: string } = {};
  if (typeof errorBody['code'] === 'string') errorParams.code = errorBody['code'];
  if (typeof errorBody['message'] === 'string') errorParams.message = errorBody['message'];
  if (typeof errorBody['error'] === 'string') errorParams.error = errorBody['error'];

  throw RenderScreenshotError.fromResponse(response.status, errorParams, retryAfter);
}

/**
 * RenderScreenshot API client
 */
export class Client {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /** Cache management methods */
  readonly cache: CacheManager;

  /**
   * Create a new RenderScreenshot client
   * @param apiKey - Your API key (rs_live_* or rs_test_*)
   * @param options - Optional client configuration
   */
  constructor(apiKey: string, options: ClientOptions = {}) {
    if (apiKey === '' || apiKey === undefined) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.cache = new CacheManager(this);
  }

  /**
   * Get the API key for internal use
   * @internal
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Get the base URL for internal use
   * @internal
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the timeout for internal use
   * @internal
   */
  getTimeout(): number {
    return this.timeout;
  }

  /**
   * Make an authenticated request to the API
   * @internal
   */
  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      responseType?: 'json' | 'buffer';
    } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${API_VERSION}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        'User-Agent': 'renderscreenshot-node/1.0.0',
        ...options.headers,
      };

      if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (options.body !== undefined) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        await handleApiError(response);
      }

      if (options.responseType === 'buffer') {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer) as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof RenderScreenshotError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw RenderScreenshotError.timeout();
      }
      throw RenderScreenshotError.internal(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Generate a signed URL for embedding screenshots
   *
   * @param options - Screenshot options (TakeOptions instance or config object)
   * @param expiresAt - Expiration time for the signed URL
   * @returns Signed URL string
   *
   * @example
   * ```typescript
   * const url = client.generateUrl(
   *   TakeOptions.url('https://example.com').preset('og_card'),
   *   new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
   * );
   * ```
   */
  generateUrl(options: TakeOptions | TakeOptionsConfig, expiresAt: Date): string {
    const config = options instanceof TakeOptions ? options.toConfig() : options;

    // Extract the public key from api key (rs_pub_xxx or use the full key for signing)
    // For signed URLs, we need a secret key (rs_secret_xxx) and a public key (rs_pub_xxx)
    // If user provides rs_live_xxx, we'll use it directly

    // Build query params from config
    const params: Record<string, string> = {};

    if (config.url !== undefined) params['url'] = config.url;
    if (config.width !== undefined) params['width'] = String(config.width);
    if (config.height !== undefined) params['height'] = String(config.height);
    if (config.scale !== undefined) params['scale'] = String(config.scale);
    if (config.mobile !== undefined) params['mobile'] = String(config.mobile);
    if (config.fullPage !== undefined) params['full_page'] = String(config.fullPage);
    if (config.element !== undefined) params['element'] = config.element;
    if (config.format !== undefined) params['format'] = config.format;
    if (config.quality !== undefined) params['quality'] = String(config.quality);
    if (config.preset !== undefined) params['preset'] = config.preset;
    if (config.device !== undefined) params['device'] = config.device;
    if (config.waitFor !== undefined) params['wait_for'] = config.waitFor;
    if (config.delay !== undefined) params['delay'] = String(config.delay);
    if (config.blockAds !== undefined) params['block_ads'] = String(config.blockAds);
    if (config.blockTrackers !== undefined) params['block_trackers'] = String(config.blockTrackers);
    if (config.blockCookieBanners !== undefined)
      params['block_cookie_banners'] = String(config.blockCookieBanners);
    if (config.blockChatWidgets !== undefined)
      params['block_chat_widgets'] = String(config.blockChatWidgets);
    if (config.darkMode !== undefined) params['dark_mode'] = String(config.darkMode);
    if (config.cacheTtl !== undefined) params['cache_ttl'] = String(config.cacheTtl);

    // Sort params alphabetically and create canonical string
    const sortedKeys = Object.keys(params).sort();
    const canonical = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');

    // Add expiration
    const expires = Math.floor(expiresAt.getTime() / 1000);
    const message = `${canonical}&expires=${expires}`;

    // Generate signature
    const signature = createHmac('sha256', this.apiKey).update(message).digest('hex');

    return `${this.baseUrl}/${API_VERSION}/screenshot?${message}&signature=${signature}`;
  }

  /**
   * Take a screenshot and return the binary data
   *
   * @param options - Screenshot options (TakeOptions instance or config object)
   * @returns Buffer containing the screenshot binary data
   *
   * @example
   * ```typescript
   * const image = await client.take(
   *   TakeOptions.url('https://example.com').preset('og_card')
   * );
   * await fs.writeFile('screenshot.png', image);
   * ```
   */
  async take(options: TakeOptions | TakeOptionsConfig): Promise<Buffer> {
    const params =
      options instanceof TakeOptions ? options.toParams() : TakeOptions.from(options).toParams();
    return this.request<Buffer>('POST', '/screenshot', {
      body: params,
      responseType: 'buffer',
    });
  }

  /**
   * Take a screenshot and return JSON metadata with URLs
   *
   * @param options - Screenshot options (TakeOptions instance or config object)
   * @returns Screenshot response with metadata and URLs
   *
   * @example
   * ```typescript
   * const response = await client.takeJson(
   *   TakeOptions.url('https://example.com').preset('og_card')
   * );
   * console.log(response.url); // CDN URL to the screenshot
   * ```
   */
  async takeJson(options: TakeOptions | TakeOptionsConfig): Promise<ScreenshotResponse> {
    const params =
      options instanceof TakeOptions ? options.toParams() : TakeOptions.from(options).toParams();
    return this.request<ScreenshotResponse>('POST', '/screenshot', {
      body: { ...params, response_type: 'json' },
    });
  }

  /**
   * Process multiple screenshots in a batch
   *
   * @param urls - Array of URLs to screenshot
   * @param options - Options to apply to all screenshots
   * @returns Batch response with results for each URL
   *
   * @example
   * ```typescript
   * const results = await client.batch(
   *   ['https://example1.com', 'https://example2.com'],
   *   TakeOptions.url('').preset('og_card')
   * );
   * ```
   */
  async batch(urls: string[], options?: TakeOptions | TakeOptionsConfig): Promise<BatchResponse>;

  /**
   * Process multiple screenshots with per-URL options
   *
   * @param requests - Array of batch request items with individual options
   * @returns Batch response with results for each URL
   *
   * @example
   * ```typescript
   * const results = await client.batch([
   *   { url: 'https://example1.com', options: { width: 1200 } },
   *   { url: 'https://example2.com', options: { preset: 'full_page' } }
   * ]);
   * ```
   */
  async batch(requests: BatchRequestItem[]): Promise<BatchResponse>;

  async batch(
    urlsOrRequests: string[] | BatchRequestItem[],
    options?: TakeOptions | TakeOptionsConfig
  ): Promise<BatchResponse> {
    // Type guard to check if it's an array of strings (URLs)
    const isUrlArray = (arr: unknown[]): arr is string[] =>
      arr.every((item) => typeof item === 'string');

    let body: Record<string, unknown>;

    if (isUrlArray(urlsOrRequests)) {
      const opts =
        options instanceof TakeOptions
          ? options.toParams()
          : options !== undefined
            ? TakeOptions.from(options).toParams()
            : {};
      body = {
        urls: urlsOrRequests,
        options: opts,
      };
    } else {
      body = {
        requests: urlsOrRequests.map((req) => ({
          url: req.url,
          ...TakeOptions.from(req.options ?? {}).toParams(),
        })),
      };
    }

    return this.request<BatchResponse>('POST', '/batch', { body });
  }

  /**
   * Get the status of a batch job
   *
   * @param batchId - The batch job ID
   * @returns Batch status and results
   */
  async getBatch(batchId: string): Promise<BatchResponse> {
    return this.request<BatchResponse>('GET', `/batch/${batchId}`);
  }

  /**
   * List all available presets
   *
   * @returns Array of preset configurations
   */
  async presets(): Promise<PresetInfo[]> {
    return this.request<PresetInfo[]>('GET', '/presets');
  }

  /**
   * Get a single preset by ID
   *
   * @param id - Preset identifier
   * @returns Preset configuration
   */
  async preset(id: string): Promise<PresetInfo> {
    return this.request<PresetInfo>('GET', `/presets/${id}`);
  }

  /**
   * List all available device presets
   *
   * @returns Array of device configurations
   */
  async devices(): Promise<DeviceInfo[]> {
    return this.request<DeviceInfo[]>('GET', '/devices');
  }
}
