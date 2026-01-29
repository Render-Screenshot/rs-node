import type {
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
} from './types.js';

/**
 * Fluent builder for screenshot options
 */
export class TakeOptions {
  private readonly config: TakeOptionsConfig;

  private constructor(config: TakeOptionsConfig = {}) {
    this.config = { ...config };
  }

  /**
   * Create options with a URL target
   */
  static url(url: string): TakeOptions {
    return new TakeOptions({ url });
  }

  /**
   * Create options with HTML content
   */
  static html(html: string): TakeOptions {
    return new TakeOptions({ html });
  }

  /**
   * Create options from an existing config
   */
  static from(config: TakeOptionsConfig): TakeOptions {
    return new TakeOptions(config);
  }

  // --- Viewport ---

  /**
   * Set viewport width in pixels
   */
  width(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, width: value });
  }

  /**
   * Set viewport height in pixels
   */
  height(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, height: value });
  }

  /**
   * Set device scale factor (1-3)
   */
  scale(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, scale: value });
  }

  /**
   * Enable mobile emulation
   */
  mobile(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, mobile: value });
  }

  // --- Capture ---

  /**
   * Capture full scrollable page
   */
  fullPage(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, fullPage: value });
  }

  /**
   * Capture specific element by CSS selector
   */
  element(selector: string): TakeOptions {
    return new TakeOptions({ ...this.config, element: selector });
  }

  /**
   * Set output format
   */
  format(value: ImageFormat): TakeOptions {
    return new TakeOptions({ ...this.config, format: value });
  }

  /**
   * Set JPEG/WebP quality (1-100)
   */
  quality(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, quality: value });
  }

  // --- Wait ---

  /**
   * Set wait condition
   */
  waitFor(value: WaitCondition): TakeOptions {
    return new TakeOptions({ ...this.config, waitFor: value });
  }

  /**
   * Add delay after page load (milliseconds)
   */
  delay(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, delay: value });
  }

  /**
   * Wait for CSS selector to appear
   */
  waitForSelector(selector: string): TakeOptions {
    return new TakeOptions({ ...this.config, waitForSelector: selector });
  }

  /**
   * Maximum wait time in milliseconds
   */
  waitForTimeout(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, waitForTimeout: value });
  }

  // --- Presets ---

  /**
   * Use a preset configuration
   */
  preset(value: Preset): TakeOptions {
    return new TakeOptions({ ...this.config, preset: value });
  }

  /**
   * Emulate a specific device
   */
  device(value: Device): TakeOptions {
    return new TakeOptions({ ...this.config, device: value });
  }

  // --- Blocking ---

  /**
   * Block ad network domains
   */
  blockAds(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, blockAds: value });
  }

  /**
   * Block analytics/tracking
   */
  blockTrackers(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, blockTrackers: value });
  }

  /**
   * Auto-dismiss cookie popups
   */
  blockCookieBanners(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, blockCookieBanners: value });
  }

  /**
   * Block chat widgets
   */
  blockChatWidgets(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, blockChatWidgets: value });
  }

  /**
   * Block URLs matching patterns (glob)
   */
  blockUrls(patterns: string[]): TakeOptions {
    return new TakeOptions({ ...this.config, blockUrls: patterns });
  }

  /**
   * Block specific resource types
   */
  blockResources(types: BlockableResource[]): TakeOptions {
    return new TakeOptions({ ...this.config, blockResources: types });
  }

  // --- Page manipulation ---

  /**
   * Inject JavaScript (inline or URL)
   */
  injectScript(script: string): TakeOptions {
    return new TakeOptions({ ...this.config, injectScript: script });
  }

  /**
   * Inject CSS (inline or URL)
   */
  injectStyle(style: string): TakeOptions {
    return new TakeOptions({ ...this.config, injectStyle: style });
  }

  /**
   * Click element before capture
   */
  click(selector: string): TakeOptions {
    return new TakeOptions({ ...this.config, click: selector });
  }

  /**
   * Hide elements (visibility: hidden)
   */
  hide(selectors: string[]): TakeOptions {
    return new TakeOptions({ ...this.config, hide: selectors });
  }

  /**
   * Remove elements from DOM
   */
  remove(selectors: string[]): TakeOptions {
    return new TakeOptions({ ...this.config, remove: selectors });
  }

  // --- Browser emulation ---

  /**
   * Enable dark mode (prefers-color-scheme: dark)
   */
  darkMode(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, darkMode: value });
  }

  /**
   * Enable reduced motion preference
   */
  reducedMotion(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, reducedMotion: value });
  }

  /**
   * Set media type emulation
   */
  mediaType(value: MediaType): TakeOptions {
    return new TakeOptions({ ...this.config, mediaType: value });
  }

  /**
   * Set custom user agent
   */
  userAgent(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, userAgent: value });
  }

  /**
   * Set timezone (IANA format)
   */
  timezone(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, timezone: value });
  }

  /**
   * Set locale (BCP 47 format)
   */
  locale(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, locale: value });
  }

  /**
   * Set geolocation coordinates
   */
  geolocation(latitude: number, longitude: number, accuracy?: number): TakeOptions {
    const geo: Geolocation = { latitude, longitude };
    if (accuracy !== undefined) {
      geo.accuracy = accuracy;
    }
    return new TakeOptions({ ...this.config, geolocation: geo });
  }

  // --- Network ---

  /**
   * Set custom HTTP headers
   */
  headers(value: Record<string, string>): TakeOptions {
    return new TakeOptions({ ...this.config, headers: value });
  }

  /**
   * Set cookies
   */
  cookies(value: Cookie[]): TakeOptions {
    return new TakeOptions({ ...this.config, cookies: value });
  }

  /**
   * Set HTTP Basic authentication
   */
  authBasic(username: string, password: string): TakeOptions {
    return new TakeOptions({ ...this.config, authBasic: { username, password } });
  }

  /**
   * Set Bearer token authentication
   */
  authBearer(token: string): TakeOptions {
    return new TakeOptions({ ...this.config, authBearer: token });
  }

  /**
   * Bypass Content Security Policy
   */
  bypassCsp(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, bypassCsp: value });
  }

  // --- Cache ---

  /**
   * Set cache TTL in seconds (3600-2592000)
   */
  cacheTtl(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, cacheTtl: value });
  }

  /**
   * Force cache refresh
   */
  cacheRefresh(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, cacheRefresh: value });
  }

  // --- PDF options ---

  /**
   * Set PDF paper size
   */
  pdfPaperSize(value: PdfPaperSize): TakeOptions {
    return new TakeOptions({ ...this.config, pdfPaperSize: value });
  }

  /**
   * Set custom PDF width (CSS units)
   */
  pdfWidth(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfWidth: value });
  }

  /**
   * Set custom PDF height (CSS units)
   */
  pdfHeight(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfHeight: value });
  }

  /**
   * Set PDF landscape orientation
   */
  pdfLandscape(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, pdfLandscape: value });
  }

  /**
   * Set uniform PDF margin (CSS units)
   */
  pdfMargin(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfMargin: value });
  }

  /**
   * Set PDF top margin
   */
  pdfMarginTop(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfMarginTop: value });
  }

  /**
   * Set PDF right margin
   */
  pdfMarginRight(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfMarginRight: value });
  }

  /**
   * Set PDF bottom margin
   */
  pdfMarginBottom(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfMarginBottom: value });
  }

  /**
   * Set PDF left margin
   */
  pdfMarginLeft(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfMarginLeft: value });
  }

  /**
   * Set PDF scale factor (0.1-2.0)
   */
  pdfScale(value: number): TakeOptions {
    return new TakeOptions({ ...this.config, pdfScale: value });
  }

  /**
   * Include background graphics in PDF
   */
  pdfPrintBackground(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, pdfPrintBackground: value });
  }

  /**
   * Set PDF page ranges (e.g., "1-5, 8")
   */
  pdfPageRanges(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfPageRanges: value });
  }

  /**
   * Set PDF header HTML template
   */
  pdfHeader(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfHeader: value });
  }

  /**
   * Set PDF footer HTML template
   */
  pdfFooter(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, pdfFooter: value });
  }

  /**
   * Fit content to single PDF page
   */
  pdfFitOnePage(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, pdfFitOnePage: value });
  }

  /**
   * Use CSS-defined page size for PDF
   */
  pdfPreferCssPageSize(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, pdfPreferCssPageSize: value });
  }

  // --- Storage (BYOS) ---

  /**
   * Enable custom storage upload
   */
  storageEnabled(value = true): TakeOptions {
    return new TakeOptions({ ...this.config, storageEnabled: value });
  }

  /**
   * Set storage path template
   */
  storagePath(value: string): TakeOptions {
    return new TakeOptions({ ...this.config, storagePath: value });
  }

  /**
   * Set storage ACL
   */
  storageAcl(value: StorageAcl): TakeOptions {
    return new TakeOptions({ ...this.config, storageAcl: value });
  }

  // --- Output ---

  /**
   * Get the raw configuration object
   */
  toConfig(): TakeOptionsConfig {
    return { ...this.config };
  }

  /**
   * Convert to API request parameters (for POST body)
   */
  toParams(): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Target
    if (this.config.url !== undefined) params['url'] = this.config.url;
    if (this.config.html !== undefined) params['html'] = this.config.html;

    // Viewport
    if (this.config.width !== undefined)
      params['viewport'] = { ...((params['viewport'] as object) ?? {}), width: this.config.width };
    if (this.config.height !== undefined)
      params['viewport'] = {
        ...((params['viewport'] as object) ?? {}),
        height: this.config.height,
      };
    if (this.config.scale !== undefined)
      params['viewport'] = { ...((params['viewport'] as object) ?? {}), scale: this.config.scale };
    if (this.config.mobile !== undefined)
      params['viewport'] = {
        ...((params['viewport'] as object) ?? {}),
        mobile: this.config.mobile,
      };

    // Capture
    if (this.config.fullPage !== undefined) params['full_page'] = this.config.fullPage;
    if (this.config.element !== undefined) params['element'] = this.config.element;
    if (this.config.format !== undefined) params['format'] = this.config.format;
    if (this.config.quality !== undefined) params['quality'] = this.config.quality;

    // Wait
    if (this.config.waitFor !== undefined) params['wait_for'] = this.config.waitFor;
    if (this.config.delay !== undefined) params['delay'] = this.config.delay;
    if (this.config.waitForSelector !== undefined)
      params['wait_for_selector'] = this.config.waitForSelector;
    if (this.config.waitForTimeout !== undefined)
      params['wait_for_timeout'] = this.config.waitForTimeout;

    // Presets
    if (this.config.preset !== undefined) params['preset'] = this.config.preset;
    if (this.config.device !== undefined) params['device'] = this.config.device;

    // Blocking
    if (this.config.blockAds !== undefined) params['block_ads'] = this.config.blockAds;
    if (this.config.blockTrackers !== undefined)
      params['block_trackers'] = this.config.blockTrackers;
    if (this.config.blockCookieBanners !== undefined)
      params['block_cookie_banners'] = this.config.blockCookieBanners;
    if (this.config.blockChatWidgets !== undefined)
      params['block_chat_widgets'] = this.config.blockChatWidgets;
    if (this.config.blockUrls !== undefined) params['block_urls'] = this.config.blockUrls;
    if (this.config.blockResources !== undefined)
      params['block_resources'] = this.config.blockResources;

    // Page manipulation
    if (this.config.injectScript !== undefined) params['inject_script'] = this.config.injectScript;
    if (this.config.injectStyle !== undefined) params['inject_style'] = this.config.injectStyle;
    if (this.config.click !== undefined) params['click'] = this.config.click;
    if (this.config.hide !== undefined) params['hide'] = this.config.hide;
    if (this.config.remove !== undefined) params['remove'] = this.config.remove;

    // Browser emulation
    if (this.config.darkMode !== undefined) params['dark_mode'] = this.config.darkMode;
    if (this.config.reducedMotion !== undefined)
      params['reduced_motion'] = this.config.reducedMotion;
    if (this.config.mediaType !== undefined) params['media_type'] = this.config.mediaType;
    if (this.config.userAgent !== undefined) params['user_agent'] = this.config.userAgent;
    if (this.config.timezone !== undefined) params['timezone'] = this.config.timezone;
    if (this.config.locale !== undefined) params['locale'] = this.config.locale;
    if (this.config.geolocation !== undefined) params['geolocation'] = this.config.geolocation;

    // Network
    if (this.config.headers !== undefined) params['headers'] = this.config.headers;
    if (this.config.cookies !== undefined) params['cookies'] = this.config.cookies;
    if (this.config.authBasic !== undefined) params['auth_basic'] = this.config.authBasic;
    if (this.config.authBearer !== undefined) params['auth_bearer'] = this.config.authBearer;
    if (this.config.bypassCsp !== undefined) params['bypass_csp'] = this.config.bypassCsp;

    // Cache
    if (this.config.cacheTtl !== undefined) params['cache_ttl'] = this.config.cacheTtl;
    if (this.config.cacheRefresh !== undefined) params['cache_refresh'] = this.config.cacheRefresh;

    // PDF
    if (this.config.pdfPaperSize !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        paper_size: this.config.pdfPaperSize,
      };
    if (this.config.pdfWidth !== undefined)
      params['pdf'] = { ...((params['pdf'] as object) ?? {}), width: this.config.pdfWidth };
    if (this.config.pdfHeight !== undefined)
      params['pdf'] = { ...((params['pdf'] as object) ?? {}), height: this.config.pdfHeight };
    if (this.config.pdfLandscape !== undefined)
      params['pdf'] = { ...((params['pdf'] as object) ?? {}), landscape: this.config.pdfLandscape };
    if (this.config.pdfMargin !== undefined)
      params['pdf'] = { ...((params['pdf'] as object) ?? {}), margin: this.config.pdfMargin };
    if (this.config.pdfMarginTop !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        margin_top: this.config.pdfMarginTop,
      };
    if (this.config.pdfMarginRight !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        margin_right: this.config.pdfMarginRight,
      };
    if (this.config.pdfMarginBottom !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        margin_bottom: this.config.pdfMarginBottom,
      };
    if (this.config.pdfMarginLeft !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        margin_left: this.config.pdfMarginLeft,
      };
    if (this.config.pdfScale !== undefined)
      params['pdf'] = { ...((params['pdf'] as object) ?? {}), scale: this.config.pdfScale };
    if (this.config.pdfPrintBackground !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        print_background: this.config.pdfPrintBackground,
      };
    if (this.config.pdfPageRanges !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        page_ranges: this.config.pdfPageRanges,
      };
    if (this.config.pdfHeader !== undefined)
      params['pdf'] = { ...((params['pdf'] as object) ?? {}), header: this.config.pdfHeader };
    if (this.config.pdfFooter !== undefined)
      params['pdf'] = { ...((params['pdf'] as object) ?? {}), footer: this.config.pdfFooter };
    if (this.config.pdfFitOnePage !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        fit_one_page: this.config.pdfFitOnePage,
      };
    if (this.config.pdfPreferCssPageSize !== undefined)
      params['pdf'] = {
        ...((params['pdf'] as object) ?? {}),
        prefer_css_page_size: this.config.pdfPreferCssPageSize,
      };

    // Storage
    if (this.config.storageEnabled !== undefined)
      params['storage'] = {
        ...((params['storage'] as object) ?? {}),
        enabled: this.config.storageEnabled,
      };
    if (this.config.storagePath !== undefined)
      params['storage'] = {
        ...((params['storage'] as object) ?? {}),
        path: this.config.storagePath,
      };
    if (this.config.storageAcl !== undefined)
      params['storage'] = { ...((params['storage'] as object) ?? {}), acl: this.config.storageAcl };

    return params;
  }

  /**
   * Convert to query string (for GET requests)
   */
  toQueryString(): string {
    const params = new URLSearchParams();

    // Target
    if (this.config.url !== undefined) params.set('url', this.config.url);

    // Viewport (flat for GET)
    if (this.config.width !== undefined) params.set('width', String(this.config.width));
    if (this.config.height !== undefined) params.set('height', String(this.config.height));
    if (this.config.scale !== undefined) params.set('scale', String(this.config.scale));
    if (this.config.mobile !== undefined) params.set('mobile', String(this.config.mobile));

    // Capture
    if (this.config.fullPage !== undefined) params.set('full_page', String(this.config.fullPage));
    if (this.config.element !== undefined) params.set('element', this.config.element);
    if (this.config.format !== undefined) params.set('format', this.config.format);
    if (this.config.quality !== undefined) params.set('quality', String(this.config.quality));

    // Wait
    if (this.config.waitFor !== undefined) params.set('wait_for', this.config.waitFor);
    if (this.config.delay !== undefined) params.set('delay', String(this.config.delay));
    if (this.config.waitForSelector !== undefined)
      params.set('wait_for_selector', this.config.waitForSelector);
    if (this.config.waitForTimeout !== undefined)
      params.set('wait_for_timeout', String(this.config.waitForTimeout));

    // Presets
    if (this.config.preset !== undefined) params.set('preset', this.config.preset);
    if (this.config.device !== undefined) params.set('device', this.config.device);

    // Blocking
    if (this.config.blockAds !== undefined) params.set('block_ads', String(this.config.blockAds));
    if (this.config.blockTrackers !== undefined)
      params.set('block_trackers', String(this.config.blockTrackers));
    if (this.config.blockCookieBanners !== undefined)
      params.set('block_cookie_banners', String(this.config.blockCookieBanners));
    if (this.config.blockChatWidgets !== undefined)
      params.set('block_chat_widgets', String(this.config.blockChatWidgets));
    if (this.config.blockUrls !== undefined) {
      this.config.blockUrls.forEach((url) => {
        params.append('block_urls', url);
      });
    }
    if (this.config.blockResources !== undefined) {
      this.config.blockResources.forEach((r) => {
        params.append('block_resources', r);
      });
    }

    // Browser emulation
    if (this.config.darkMode !== undefined) params.set('dark_mode', String(this.config.darkMode));
    if (this.config.reducedMotion !== undefined)
      params.set('reduced_motion', String(this.config.reducedMotion));
    if (this.config.mediaType !== undefined) params.set('media_type', this.config.mediaType);
    if (this.config.userAgent !== undefined) params.set('user_agent', this.config.userAgent);
    if (this.config.timezone !== undefined) params.set('timezone', this.config.timezone);
    if (this.config.locale !== undefined) params.set('locale', this.config.locale);

    // Cache
    if (this.config.cacheTtl !== undefined) params.set('cache_ttl', String(this.config.cacheTtl));
    if (this.config.cacheRefresh !== undefined)
      params.set('cache_refresh', String(this.config.cacheRefresh));

    return params.toString();
  }
}
