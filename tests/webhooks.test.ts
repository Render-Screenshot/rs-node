import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyWebhook, parseWebhook, extractWebhookHeaders } from '../src/webhooks.js';

describe('verifyWebhook', () => {
  const secret = 'whsec_test_secret_key';

  function createValidSignature(payload: string, timestamp: string): string {
    const message = `${timestamp}.${payload}`;
    return `sha256=${createHmac('sha256', secret).update(message).digest('hex')}`;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-18T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for valid signature', () => {
    const timestamp = '1705579200'; // 2024-01-18T12:00:00Z
    const payload = '{"event":"screenshot.completed","id":"req_abc123"}';
    const signature = createValidSignature(payload, timestamp);

    expect(verifyWebhook(payload, signature, timestamp, secret)).toBe(true);
  });

  it('returns false for invalid signature', () => {
    const timestamp = '1705579200';
    const payload = '{"event":"screenshot.completed","id":"req_abc123"}';
    const signature = 'sha256=invalid_signature_here';

    expect(verifyWebhook(payload, signature, timestamp, secret)).toBe(false);
  });

  it('returns false for tampered payload', () => {
    const timestamp = '1705579200';
    const originalPayload = '{"event":"screenshot.completed","id":"req_abc123"}';
    const signature = createValidSignature(originalPayload, timestamp);
    const tamperedPayload = '{"event":"screenshot.completed","id":"req_xyz789"}';

    expect(verifyWebhook(tamperedPayload, signature, timestamp, secret)).toBe(false);
  });

  it('returns false for wrong secret', () => {
    const timestamp = '1705579200';
    const payload = '{"event":"screenshot.completed","id":"req_abc123"}';
    const signature = createValidSignature(payload, timestamp);

    expect(verifyWebhook(payload, signature, timestamp, 'wrong_secret')).toBe(false);
  });

  it('returns false for empty inputs', () => {
    expect(verifyWebhook('', 'sha256=xxx', '1705579200', secret)).toBe(false);
    expect(verifyWebhook('{}', '', '1705579200', secret)).toBe(false);
    expect(verifyWebhook('{}', 'sha256=xxx', '', secret)).toBe(false);
    expect(verifyWebhook('{}', 'sha256=xxx', '1705579200', '')).toBe(false);
  });

  it('returns false for invalid timestamp format', () => {
    const payload = '{"event":"screenshot.completed"}';
    const signature = createValidSignature(payload, 'not_a_number');

    expect(verifyWebhook(payload, signature, 'not_a_number', secret)).toBe(false);
  });

  it('returns false for expired timestamp (more than 5 minutes old)', () => {
    const oldTimestamp = '1705575600'; // 1 hour before current time
    const payload = '{"event":"screenshot.completed","id":"req_abc123"}';
    const signature = createValidSignature(payload, oldTimestamp);

    expect(verifyWebhook(payload, signature, oldTimestamp, secret)).toBe(false);
  });

  it('returns false for future timestamp (more than 5 minutes ahead)', () => {
    const futureTimestamp = '1705583400'; // 1 hour ahead of current time
    const payload = '{"event":"screenshot.completed","id":"req_abc123"}';
    const signature = createValidSignature(payload, futureTimestamp);

    expect(verifyWebhook(payload, signature, futureTimestamp, secret)).toBe(false);
  });

  it('accepts timestamp within 5 minute tolerance', () => {
    const slightlyOldTimestamp = String(1705579200 - 4 * 60); // 4 minutes old
    const payload = '{"event":"screenshot.completed","id":"req_abc123"}';
    const signature = createValidSignature(payload, slightlyOldTimestamp);

    expect(verifyWebhook(payload, signature, slightlyOldTimestamp, secret)).toBe(true);
  });
});

describe('parseWebhook', () => {
  describe('screenshot.completed', () => {
    it('parses screenshot completed event from string', () => {
      const payload = JSON.stringify({
        event: 'screenshot.completed',
        id: 'req_abc123def456',
        timestamp: '2024-01-18T12:00:00Z',
        data: {
          url: 'https://example.com',
          screenshot_url: 'https://cdn.renderscreenshot.com/abc.png',
          width: 1200,
          height: 630,
          size: 123456,
          format: 'png',
          cached: false,
        },
      });

      const event = parseWebhook(payload);

      expect(event.type).toBe('screenshot.completed');
      expect(event.id).toBe('req_abc123def456');
      expect(event.timestamp).toEqual(new Date('2024-01-18T12:00:00Z'));
      expect(event.data.url).toBe('https://example.com');
      expect(event.data.response?.url).toBe('https://cdn.renderscreenshot.com/abc.png');
      expect(event.data.response?.width).toBe(1200);
      expect(event.data.response?.height).toBe(630);
      expect(event.data.response?.size).toBe(123456);
      expect(event.data.response?.format).toBe('png');
      expect(event.data.response?.cached).toBe(false);
    });

    it('parses screenshot completed event from object', () => {
      const payload = {
        event: 'screenshot.completed',
        id: 'req_abc123',
        timestamp: '2024-01-18T12:00:00Z',
        data: {
          url: 'https://example.com',
          screenshot_url: 'https://cdn.renderscreenshot.com/abc.png',
          width: 1200,
          height: 630,
        },
      };

      const event = parseWebhook(payload);

      expect(event.type).toBe('screenshot.completed');
      expect(event.data.response?.url).toBe('https://cdn.renderscreenshot.com/abc.png');
    });
  });

  describe('screenshot.failed', () => {
    it('parses screenshot failed event', () => {
      const payload = {
        event: 'screenshot.failed',
        id: 'req_abc123def456',
        timestamp: '2024-01-18T12:00:00Z',
        data: {
          url: 'https://example.com',
          error: 'Page failed to load within 30 seconds',
        },
      };

      const event = parseWebhook(payload);

      expect(event.type).toBe('screenshot.failed');
      expect(event.data.url).toBe('https://example.com');
      expect(event.data.error?.code).toBe('render_failed');
      expect(event.data.error?.message).toBe('Page failed to load within 30 seconds');
    });
  });

  describe('batch.completed', () => {
    it('parses batch completed event', () => {
      const payload = {
        event: 'batch.completed',
        id: 'batch_abc123',
        timestamp: '2024-01-18T12:00:00Z',
        data: {
          summary: {
            total: 10,
            completed: 9,
            failed: 1,
          },
          results_url: 'https://api.renderscreenshot.com/v1/batches/batch_abc123',
        },
      };

      const event = parseWebhook(payload);

      expect(event.type).toBe('batch.completed');
      expect(event.id).toBe('batch_abc123');
      expect(event.data.batchId).toBe('batch_abc123');
    });
  });

  describe('batch.failed', () => {
    it('parses batch failed event', () => {
      const payload = {
        event: 'batch.failed',
        id: 'batch_abc123',
        timestamp: '2024-01-18T12:00:00Z',
        data: {
          summary: {
            total: 10,
            completed: 0,
            failed: 10,
          },
        },
      };

      const event = parseWebhook(payload);

      expect(event.type).toBe('batch.failed');
      expect(event.data.batchId).toBe('batch_abc123');
    });
  });
});

describe('extractWebhookHeaders', () => {
  it('extracts headers from plain object', () => {
    const headers = {
      'X-Webhook-Signature': 'sha256=abc123',
      'X-Webhook-Timestamp': '1705579200',
    };

    const result = extractWebhookHeaders(headers);

    expect(result.signature).toBe('sha256=abc123');
    expect(result.timestamp).toBe('1705579200');
  });

  it('extracts headers from lowercase object', () => {
    const headers = {
      'x-webhook-signature': 'sha256=abc123',
      'x-webhook-timestamp': '1705579200',
    };

    const result = extractWebhookHeaders(headers);

    expect(result.signature).toBe('sha256=abc123');
    expect(result.timestamp).toBe('1705579200');
  });

  it('handles array values', () => {
    const headers: Record<string, string | string[]> = {
      'X-Webhook-Signature': ['sha256=abc123', 'sha256=def456'],
      'X-Webhook-Timestamp': ['1705579200'],
    };

    const result = extractWebhookHeaders(headers);

    expect(result.signature).toBe('sha256=abc123');
    expect(result.timestamp).toBe('1705579200');
  });

  it('returns empty strings for missing headers', () => {
    const headers = {};

    const result = extractWebhookHeaders(headers);

    expect(result.signature).toBe('');
    expect(result.timestamp).toBe('');
  });

  it('extracts from Headers object (fetch API)', () => {
    const headers = new Headers();
    headers.set('X-Webhook-Signature', 'sha256=abc123');
    headers.set('X-Webhook-Timestamp', '1705579200');

    const result = extractWebhookHeaders(headers);

    expect(result.signature).toBe('sha256=abc123');
    expect(result.timestamp).toBe('1705579200');
  });
});
