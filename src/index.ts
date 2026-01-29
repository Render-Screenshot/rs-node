/**
 * RenderScreenshot Node.js SDK
 *
 * Official Node.js/TypeScript SDK for the RenderScreenshot API.
 *
 * @packageDocumentation
 * @module renderscreenshot
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { Client, TakeOptions } from 'renderscreenshot';
 *
 * const client = new Client('rs_live_xxxxx');
 *
 * // Take a screenshot
 * const image = await client.take(
 *   TakeOptions.url('https://example.com').preset('og_card')
 * );
 *
 * // Generate a signed URL for embedding
 * const url = client.generateUrl(
 *   TakeOptions.url('https://example.com').preset('og_card'),
 *   new Date(Date.now() + 24 * 60 * 60 * 1000)
 * );
 * ```
 */

// Main exports
export { Client } from './client.js';
export { TakeOptions } from './options.js';
export { RenderScreenshotError } from './errors.js';
export type { ErrorCode } from './errors.js';
export { CacheManager } from './cache.js';
export { verifyWebhook, parseWebhook, extractWebhookHeaders } from './webhooks.js';

// Type exports
export type {
  // Client options
  ClientOptions,

  // Screenshot options
  TakeOptionsConfig,
  ImageFormat,
  WaitCondition,
  BlockableResource,
  MediaType,
  StorageAcl,
  Preset,
  Device,
  PdfPaperSize,
  Cookie,
  Geolocation,

  // Responses
  ScreenshotResponse,
  BatchRequestItem,
  BatchResponseItem,
  BatchResponse,

  // Cache
  CacheEntry,
  PurgeResult,

  // Webhooks
  WebhookEventType,
  WebhookEvent,

  // Metadata
  PresetInfo,
  DeviceInfo,
} from './types.js';
