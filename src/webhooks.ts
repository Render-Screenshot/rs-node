import { createHmac, timingSafeEqual } from 'node:crypto';
import type { WebhookEvent, WebhookEventType } from './types.js';

/**
 * Raw webhook payload from the API
 */
interface RawWebhookPayload {
  event: string;
  id: string;
  timestamp: string;
  data: {
    url?: string;
    screenshot_url?: string;
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    cached?: boolean;
    error?: string;
    summary?: {
      total: number;
      completed: number;
      failed: number;
    };
    results_url?: string;
  };
}

/**
 * Verify a webhook signature
 *
 * Webhooks are signed using HMAC-SHA256 with the format:
 * `sha256=hmac(secret, "${timestamp}.${payload}")`
 *
 * @param payload - The raw request body as a string
 * @param signature - The X-Webhook-Signature header value
 * @param timestamp - The X-Webhook-Timestamp header value
 * @param secret - Your webhook signing secret from the dashboard
 * @returns true if the signature is valid
 *
 * @example
 * ```typescript
 * import { verifyWebhook } from 'renderscreenshot';
 *
 * // In your webhook handler
 * const signature = req.headers['x-webhook-signature'];
 * const timestamp = req.headers['x-webhook-timestamp'];
 * const payload = JSON.stringify(req.body);
 *
 * if (verifyWebhook(payload, signature, timestamp, process.env.WEBHOOK_SECRET)) {
 *   // Process webhook
 * } else {
 *   res.status(401).send('Invalid signature');
 * }
 * ```
 */
export function verifyWebhook(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  // Validate inputs
  if (payload === '' || signature === '' || timestamp === '' || secret === '') {
    return false;
  }

  // Check timestamp to prevent replay attacks (5 minute tolerance)
  const timestampNum = parseInt(timestamp, 10);
  if (isNaN(timestampNum)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const tolerance = 5 * 60; // 5 minutes
  if (Math.abs(now - timestampNum) > tolerance) {
    return false;
  }

  // Compute expected signature
  const message = `${timestamp}.${payload}`;
  const expected = `sha256=${createHmac('sha256', secret).update(message).digest('hex')}`;

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    // Buffers have different lengths
    return false;
  }
}

/**
 * Parse a webhook payload into a typed event object
 *
 * @param payload - The raw request body (string or parsed object)
 * @returns Typed webhook event
 *
 * @example
 * ```typescript
 * import { parseWebhook, verifyWebhook } from 'renderscreenshot';
 *
 * // After verifying signature
 * const event = parseWebhook(req.body);
 *
 * if (event.type === 'screenshot.completed') {
 *   console.log(`Screenshot ready: ${event.data.response?.url}`);
 * }
 * ```
 */
export function parseWebhook(payload: string | Record<string, unknown>): WebhookEvent {
  const raw = typeof payload === 'string' ? (JSON.parse(payload) as unknown) : payload;

  const data = raw as RawWebhookPayload;

  const event: WebhookEvent = {
    id: data.id,
    type: data.event as WebhookEventType,
    timestamp: new Date(data.timestamp),
    data: {},
  };

  // Parse based on event type
  switch (data.event) {
    case 'screenshot.completed': {
      const eventData: WebhookEvent['data'] = {
        response: {
          url: data.data.screenshot_url ?? '',
          width: data.data.width ?? 0,
          height: data.data.height ?? 0,
          format: (data.data.format ?? 'png') as 'png' | 'jpeg' | 'webp' | 'pdf',
          size: data.data.size ?? 0,
          cached: data.data.cached ?? false,
        },
      };
      if (data.data.url !== undefined) {
        eventData.url = data.data.url;
      }
      event.data = eventData;
      break;
    }

    case 'screenshot.failed': {
      const eventData: WebhookEvent['data'] = {
        error: {
          code: 'render_failed',
          message: data.data.error ?? 'Unknown error',
        },
      };
      if (data.data.url !== undefined) {
        eventData.url = data.data.url;
      }
      event.data = eventData;
      break;
    }

    case 'batch.completed':
    case 'batch.failed':
      event.data = {
        batchId: data.id,
      };
      break;
  }

  return event;
}

/**
 * Extract webhook headers from a request-like object
 *
 * @param headers - Headers object (works with Express, Node http, etc.)
 * @returns Object with signature and timestamp
 */
export function extractWebhookHeaders(
  headers: Record<string, string | string[] | undefined> | Headers
): { signature: string; timestamp: string } {
  const getHeader = (name: string): string => {
    if (headers instanceof Headers) {
      return headers.get(name) ?? '';
    }
    const value = headers[name] ?? headers[name.toLowerCase()];
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }
    return value ?? '';
  };

  return {
    signature: getHeader('X-Webhook-Signature'),
    timestamp: getHeader('X-Webhook-Timestamp'),
  };
}
