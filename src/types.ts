/**
 * Client configuration options
 */
export interface ClientOptions {
  /** Base URL for the API (defaults to https://api.renderscreenshot.com) */
  baseUrl?: string;
  /** Request timeout in milliseconds (defaults to 30000) */
  timeout?: number;
}

/**
 * Screenshot format options
 */
export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'pdf';

/**
 * Wait condition types
 */
export type WaitCondition = 'load' | 'networkidle' | 'domcontentloaded';

/**
 * Resource types that can be blocked
 */
export type BlockableResource = 'font' | 'media' | 'image' | 'script' | 'stylesheet';

/**
 * Media type emulation
 */
export type MediaType = 'screen' | 'print';

/**
 * Storage ACL options
 */
export type StorageAcl = 'public-read' | 'private';

/**
 * Preset identifiers
 */
export type Preset =
  | 'og_card'
  | 'twitter_card'
  | 'twitter_card_large'
  | 'full_page'
  | 'mobile'
  | 'mobile_landscape'
  | 'desktop_hd'
  | 'desktop_4k'
  | 'link_preview'
  | 'pdf_document';

/**
 * Device identifiers
 */
export type Device =
  | 'iphone_14_pro'
  | 'iphone_14'
  | 'iphone_se'
  | 'pixel_7'
  | 'pixel_7_pro'
  | 'samsung_galaxy_s23'
  | 'ipad_pro_12'
  | 'ipad_air'
  | 'macbook_pro_16'
  | 'macbook_air_15'
  | 'imac_24'
  | 'desktop_1080p'
  | 'desktop_1440p'
  | 'desktop_4k'
  | 'surface_pro';

/**
 * PDF paper size options
 */
export type PdfPaperSize =
  | 'a0'
  | 'a1'
  | 'a2'
  | 'a3'
  | 'a4'
  | 'a5'
  | 'a6'
  | 'letter'
  | 'legal'
  | 'tabloid';

/**
 * Cookie configuration
 */
export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Geolocation configuration
 */
export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Screenshot options configuration
 */
export interface TakeOptionsConfig {
  // Target
  url?: string;
  html?: string;

  // Viewport
  width?: number;
  height?: number;
  scale?: number;
  mobile?: boolean;

  // Capture
  fullPage?: boolean;
  element?: string;
  format?: ImageFormat;
  quality?: number;

  // Wait
  waitFor?: WaitCondition;
  delay?: number;
  waitForSelector?: string;
  waitForTimeout?: number;

  // Presets
  preset?: Preset;
  device?: Device;

  // Blocking
  blockAds?: boolean;
  blockTrackers?: boolean;
  blockCookieBanners?: boolean;
  blockChatWidgets?: boolean;
  blockUrls?: string[];
  blockResources?: BlockableResource[];

  // Page manipulation
  injectScript?: string;
  injectStyle?: string;
  click?: string;
  hide?: string[];
  remove?: string[];

  // Browser emulation
  darkMode?: boolean;
  reducedMotion?: boolean;
  mediaType?: MediaType;
  userAgent?: string;
  timezone?: string;
  locale?: string;
  geolocation?: Geolocation;

  // Network
  headers?: Record<string, string>;
  cookies?: Cookie[];
  authBasic?: { username: string; password: string };
  authBearer?: string;
  bypassCsp?: boolean;

  // Cache
  cacheTtl?: number;
  cacheRefresh?: boolean;

  // PDF options
  pdfPaperSize?: PdfPaperSize;
  pdfWidth?: string;
  pdfHeight?: string;
  pdfLandscape?: boolean;
  pdfMargin?: string;
  pdfMarginTop?: string;
  pdfMarginRight?: string;
  pdfMarginBottom?: string;
  pdfMarginLeft?: string;
  pdfScale?: number;
  pdfPrintBackground?: boolean;
  pdfPageRanges?: string;
  pdfHeader?: string;
  pdfFooter?: string;
  pdfFitOnePage?: boolean;
  pdfPreferCssPageSize?: boolean;

  // Storage (BYOS)
  storageEnabled?: boolean;
  storagePath?: string;
  storageAcl?: StorageAcl;
}

/**
 * Screenshot response from takeJson
 */
export interface ScreenshotResponse {
  /** URL to the screenshot image */
  url: string;
  /** Cache URL (CDN link) */
  cacheUrl?: string;
  /** Screenshot width in pixels */
  width: number;
  /** Screenshot height in pixels */
  height: number;
  /** Image format */
  format: ImageFormat;
  /** File size in bytes */
  size: number;
  /** Cache key for the screenshot */
  cacheKey?: string;
  /** Time to live in seconds */
  ttl?: number;
  /** Whether the response was served from cache */
  cached: boolean;
  /** Storage path if BYOS was used */
  storagePath?: string;
}

/**
 * Batch request item
 */
export interface BatchRequestItem {
  url: string;
  options?: Partial<TakeOptionsConfig>;
}

/**
 * Batch response item
 */
export interface BatchResponseItem {
  url: string;
  success: boolean;
  response?: ScreenshotResponse;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Batch response
 */
export interface BatchResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total: number;
  completed: number;
  failed: number;
  results: BatchResponseItem[];
}

/**
 * Cache entry metadata
 */
export interface CacheEntry {
  key: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  size: number;
  format: ImageFormat;
}

/**
 * Purge operation result
 */
export interface PurgeResult {
  purged: number;
  keys: string[];
}

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'screenshot.completed'
  | 'screenshot.failed'
  | 'batch.completed'
  | 'batch.failed';

/**
 * Webhook event payload
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: Date;
  data: {
    url?: string;
    batchId?: string;
    response?: ScreenshotResponse;
    error?: {
      code: string;
      message: string;
    };
  };
}

/**
 * Preset metadata
 */
export interface PresetInfo {
  id: Preset;
  name: string;
  description: string;
  width: number;
  height: number;
  scale?: number;
  format?: ImageFormat;
}

/**
 * Device metadata
 */
export interface DeviceInfo {
  id: Device;
  name: string;
  width: number;
  height: number;
  scale: number;
  mobile: boolean;
  userAgent: string;
}
