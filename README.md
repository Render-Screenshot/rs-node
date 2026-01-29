# RenderScreenshot Node.js SDK

Official Node.js/TypeScript SDK for [RenderScreenshot](https://renderscreenshot.com) - A developer-friendly screenshot API.

## Installation

```bash
npm install renderscreenshot
```

## Quick Start

```typescript
import { Client, TakeOptions } from 'renderscreenshot';

// Initialize the client
const client = new Client('rs_live_xxxxx');

// Take a screenshot
const image = await client.take(
  TakeOptions.url('https://example.com').preset('og_card')
);

// Save to file
import { writeFile } from 'fs/promises';
await writeFile('screenshot.png', image);
```

## Features

- **Full TypeScript support** - Complete type definitions for all options
- **Fluent builder pattern** - Chain methods for clean, readable code
- **All screenshot options** - Viewport, format, blocking, PDF, and more
- **Batch processing** - Capture multiple screenshots in one request
- **Cache management** - Retrieve, delete, and purge cached screenshots
- **Webhook verification** - Secure webhook signature verification
- **Signed URLs** - Generate secure URLs for public embedding

## Usage

### Basic Screenshot

```typescript
import { Client, TakeOptions } from 'renderscreenshot';

const client = new Client('rs_live_xxxxx');

// Take a PNG screenshot
const image = await client.take(
  TakeOptions.url('https://example.com')
    .width(1200)
    .height(630)
    .format('png')
);
```

### Using Presets

```typescript
// OG Card preset (1200x630)
const ogCard = await client.take(
  TakeOptions.url('https://example.com').preset('og_card')
);

// Twitter Card preset
const twitterCard = await client.take(
  TakeOptions.url('https://example.com').preset('twitter_card')
);

// Full page screenshot
const fullPage = await client.take(
  TakeOptions.url('https://example.com').preset('full_page')
);
```

### Device Emulation

```typescript
// iPhone 14 Pro
const mobile = await client.take(
  TakeOptions.url('https://example.com').device('iphone_14_pro')
);

// iPad Pro
const tablet = await client.take(
  TakeOptions.url('https://example.com').device('ipad_pro_12')
);
```

### Content Blocking

```typescript
const image = await client.take(
  TakeOptions.url('https://example.com')
    .blockAds()
    .blockTrackers()
    .blockCookieBanners()
    .blockChatWidgets()
);
```

### Dark Mode & Browser Emulation

```typescript
const image = await client.take(
  TakeOptions.url('https://example.com')
    .darkMode()
    .timezone('America/New_York')
    .locale('en-US')
);
```

### PDF Generation

```typescript
const pdf = await client.take(
  TakeOptions.url('https://example.com/report')
    .format('pdf')
    .pdfPaperSize('a4')
    .pdfLandscape()
    .pdfPrintBackground()
    .pdfMargin('1in')
);
```

### JSON Response

```typescript
const response = await client.takeJson(
  TakeOptions.url('https://example.com').preset('og_card')
);

console.log(response.url);      // CDN URL
console.log(response.width);    // 1200
console.log(response.height);   // 630
console.log(response.cached);   // true/false
```

### Signed URLs for Embedding

Generate secure URLs for public `<img>` tags without exposing your API key:

```typescript
const signedUrl = client.generateUrl(
  TakeOptions.url('https://example.com').preset('og_card'),
  new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
);

// Use in HTML: <img src="${signedUrl}" />
```

### Batch Processing

```typescript
// Simple batch with same options
const results = await client.batch(
  ['https://example1.com', 'https://example2.com', 'https://example3.com'],
  TakeOptions.url('').preset('og_card')
);

// Advanced batch with per-URL options
const results = await client.batch([
  { url: 'https://example1.com', options: { width: 1200 } },
  { url: 'https://example2.com', options: { preset: 'full_page' } },
  { url: 'https://example3.com', options: { darkMode: true } },
]);

// Check batch status
const status = await client.getBatch('batch_abc123');
```

### Cache Management

```typescript
// Get cached screenshot
const cached = await client.cache.get('cache_xyz789');

// Delete single entry
await client.cache.delete('cache_xyz789');

// Bulk purge by keys
await client.cache.purge(['cache_abc', 'cache_def']);

// Purge by URL pattern
await client.cache.purgeUrl('https://mysite.com/blog/*');

// Purge entries older than a date
await client.cache.purgeBefore(new Date('2024-01-01'));
```

### Webhook Verification

```typescript
import { verifyWebhook, parseWebhook } from 'renderscreenshot';

// In your webhook handler
const signature = req.headers['x-webhook-signature'];
const timestamp = req.headers['x-webhook-timestamp'];
const payload = JSON.stringify(req.body);

if (verifyWebhook(payload, signature, timestamp, process.env.WEBHOOK_SECRET)) {
  const event = parseWebhook(req.body);

  if (event.type === 'screenshot.completed') {
    console.log('Screenshot ready:', event.data.response?.url);
  }
} else {
  res.status(401).send('Invalid signature');
}
```

## All Screenshot Options

### Target

| Method | Description |
|--------|-------------|
| `url(string)` | URL to capture |
| `html(string)` | HTML content to render |

### Viewport

| Method | Description |
|--------|-------------|
| `width(number)` | Viewport width in pixels |
| `height(number)` | Viewport height in pixels |
| `scale(number)` | Device scale factor (1-3) |
| `mobile(boolean)` | Enable mobile emulation |

### Capture

| Method | Description |
|--------|-------------|
| `fullPage(boolean)` | Capture full scrollable page |
| `element(string)` | CSS selector for element capture |
| `format(string)` | `png`, `jpeg`, `webp`, `pdf` |
| `quality(number)` | JPEG/WebP quality (1-100) |

### Wait Conditions

| Method | Description |
|--------|-------------|
| `waitFor(string)` | `load`, `networkidle`, `domcontentloaded` |
| `delay(number)` | Additional delay in milliseconds |
| `waitForSelector(string)` | Wait for CSS selector to appear |
| `waitForTimeout(number)` | Maximum wait time in ms |

### Presets & Devices

| Method | Description |
|--------|-------------|
| `preset(string)` | `og_card`, `twitter_card`, `full_page`, etc. |
| `device(string)` | `iphone_14_pro`, `pixel_7`, `ipad_pro_12`, etc. |

### Content Blocking

| Method | Description |
|--------|-------------|
| `blockAds(boolean)` | Block ad network domains |
| `blockTrackers(boolean)` | Block analytics/tracking |
| `blockCookieBanners(boolean)` | Auto-dismiss cookie popups |
| `blockChatWidgets(boolean)` | Block chat widgets |
| `blockUrls(string[])` | Block URLs matching patterns |
| `blockResources(string[])` | Block resource types |

### Browser Emulation

| Method | Description |
|--------|-------------|
| `darkMode(boolean)` | Enable prefers-color-scheme: dark |
| `reducedMotion(boolean)` | Enable prefers-reduced-motion |
| `mediaType(string)` | `screen` or `print` |
| `userAgent(string)` | Custom user agent |
| `timezone(string)` | IANA timezone |
| `locale(string)` | BCP 47 locale |
| `geolocation(lat, lng, accuracy)` | Spoof geolocation |

### Network

| Method | Description |
|--------|-------------|
| `headers(object)` | Custom HTTP headers |
| `cookies(array)` | Cookies to set |
| `authBasic(user, pass)` | HTTP Basic authentication |
| `authBearer(token)` | Bearer token authentication |
| `bypassCsp(boolean)` | Bypass Content Security Policy |

### Cache

| Method | Description |
|--------|-------------|
| `cacheTtl(number)` | Cache TTL in seconds |
| `cacheRefresh(boolean)` | Force cache refresh |

### PDF Options

| Method | Description |
|--------|-------------|
| `pdfPaperSize(string)` | `a4`, `letter`, `legal`, etc. |
| `pdfWidth(string)` | Custom width (CSS units) |
| `pdfHeight(string)` | Custom height (CSS units) |
| `pdfLandscape(boolean)` | Landscape orientation |
| `pdfMargin(string)` | Uniform margin |
| `pdfScale(number)` | Scale factor (0.1-2.0) |
| `pdfPrintBackground(boolean)` | Include backgrounds |
| `pdfPageRanges(string)` | Page ranges |
| `pdfHeader(string)` | Header HTML template |
| `pdfFooter(string)` | Footer HTML template |

### Storage (BYOS)

| Method | Description |
|--------|-------------|
| `storageEnabled(boolean)` | Upload to custom storage |
| `storagePath(string)` | Path template |
| `storageAcl(string)` | `public-read` or `private` |

## Error Handling

```typescript
import { RenderScreenshotError } from 'renderscreenshot';

try {
  const image = await client.take(TakeOptions.url('https://example.com'));
} catch (error) {
  if (error instanceof RenderScreenshotError) {
    console.error('HTTP Status:', error.httpStatus);
    console.error('Error Code:', error.code);
    console.error('Message:', error.message);
    console.error('Retryable:', error.retryable);

    if (error.retryAfter) {
      console.log(`Retry after ${error.retryAfter} seconds`);
    }
  }
}
```

### Error Codes

| Code | HTTP | Retryable | Description |
|------|------|-----------|-------------|
| `invalid_request` | 400 | No | Malformed request |
| `invalid_url` | 400 | No | Invalid URL provided |
| `unauthorized` | 401 | No | Invalid API key |
| `forbidden` | 403 | No | Access denied |
| `not_found` | 404 | No | Resource not found |
| `rate_limited` | 429 | Yes | Rate limit exceeded |
| `timeout` | 408 | Yes | Screenshot timed out |
| `render_failed` | 500 | Yes | Browser rendering failed |
| `internal_error` | 500 | Yes | Internal server error |

## Requirements

- Node.js 18.0.0 or higher
- Native `fetch` support (built into Node.js 18+)

## License

MIT

## Links

- [Documentation](https://renderscreenshot.com/docs)
- [API Reference](https://renderscreenshot.com/docs/endpoints/post-screenshot)
- [GitHub Issues](https://github.com/renderscreenshot/rs-node/issues)
