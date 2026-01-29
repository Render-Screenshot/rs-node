# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-28

### Added

- Initial release of the RenderScreenshot Node.js SDK
- `Client` class for API interactions
- `TakeOptions` fluent builder for screenshot configuration
- `take()` method for binary screenshot responses
- `takeJson()` method for JSON metadata responses
- `generateUrl()` method for signed URL generation
- `batch()` method for batch screenshot processing
- `getBatch()` method for batch status checking
- `cache.get()`, `cache.delete()`, `cache.purge()` for cache management
- `verifyWebhook()` and `parseWebhook()` helpers for webhook handling
- Full TypeScript type definitions
- Comprehensive test suite (143 tests)
- Support for all screenshot options:
  - Viewport settings (width, height, scale, mobile)
  - Capture options (fullPage, element, format, quality)
  - Wait conditions (waitFor, delay, selector, timeout)
  - Presets and device emulation
  - Content blocking (ads, trackers, cookie banners, chat widgets)
  - Browser emulation (darkMode, timezone, locale, geolocation)
  - Network options (headers, cookies, authentication)
  - PDF generation with full customization
  - BYOS (Bring Your Own Storage) support

### Technical Details

- Supports CommonJS and ESM modules
- Requires Node.js 18+ (uses native fetch)
- Full TypeScript support with strict type checking
