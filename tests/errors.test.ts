import { describe, it, expect } from 'vitest';
import { RenderScreenshotError } from '../src/errors.js';

describe('RenderScreenshotError', () => {
  describe('constructor', () => {
    it('creates an error with all properties', () => {
      const error = new RenderScreenshotError(400, 'invalid_url', 'Invalid URL provided');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RenderScreenshotError);
      expect(error.name).toBe('RenderScreenshotError');
      expect(error.httpStatus).toBe(400);
      expect(error.code).toBe('invalid_url');
      expect(error.message).toBe('Invalid URL provided');
      expect(error.retryable).toBe(false);
      expect(error.retryAfter).toBeUndefined();
    });

    it('includes retryAfter when provided', () => {
      const error = new RenderScreenshotError(429, 'rate_limited', 'Rate limit exceeded', 60);

      expect(error.retryAfter).toBe(60);
    });

    it('has a proper stack trace', () => {
      const error = new RenderScreenshotError(500, 'internal_error', 'Something went wrong');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('RenderScreenshotError');
    });
  });

  describe('retryable errors', () => {
    const retryableErrors = [
      { code: 'rate_limited', httpStatus: 429 },
      { code: 'timeout', httpStatus: 408 },
      { code: 'render_failed', httpStatus: 500 },
      { code: 'internal_error', httpStatus: 500 },
    ] as const;

    retryableErrors.forEach(({ code, httpStatus }) => {
      it(`marks ${code} as retryable`, () => {
        const error = new RenderScreenshotError(httpStatus, code, 'Error message');
        expect(error.retryable).toBe(true);
      });
    });
  });

  describe('non-retryable errors', () => {
    const nonRetryableErrors = [
      { code: 'invalid_request', httpStatus: 400 },
      { code: 'invalid_url', httpStatus: 400 },
      { code: 'unauthorized', httpStatus: 401 },
      { code: 'forbidden', httpStatus: 403 },
      { code: 'not_found', httpStatus: 404 },
    ] as const;

    nonRetryableErrors.forEach(({ code, httpStatus }) => {
      it(`marks ${code} as non-retryable`, () => {
        const error = new RenderScreenshotError(httpStatus, code, 'Error message');
        expect(error.retryable).toBe(false);
      });
    });
  });

  describe('fromResponse', () => {
    it('creates error from API response body', () => {
      const error = RenderScreenshotError.fromResponse(400, {
        code: 'invalid_url',
        message: 'The URL provided is not valid',
      });

      expect(error.httpStatus).toBe(400);
      expect(error.code).toBe('invalid_url');
      expect(error.message).toBe('The URL provided is not valid');
    });

    it('handles error field instead of message', () => {
      const error = RenderScreenshotError.fromResponse(500, {
        error: 'Internal server error',
      });

      expect(error.message).toBe('Internal server error');
      expect(error.code).toBe('internal_error');
    });

    it('handles empty body', () => {
      const error = RenderScreenshotError.fromResponse(500, {});

      expect(error.message).toBe('An unknown error occurred');
      expect(error.code).toBe('internal_error');
    });

    it('includes retryAfter when provided', () => {
      const error = RenderScreenshotError.fromResponse(
        429,
        { code: 'rate_limited', message: 'Too many requests' },
        60
      );

      expect(error.retryAfter).toBe(60);
    });
  });

  describe('static factory methods', () => {
    it('creates invalid URL error', () => {
      const error = RenderScreenshotError.invalidUrl('not-a-url');

      expect(error.httpStatus).toBe(400);
      expect(error.code).toBe('invalid_url');
      expect(error.message).toContain('not-a-url');
      expect(error.retryable).toBe(false);
    });

    it('creates invalid request error', () => {
      const error = RenderScreenshotError.invalidRequest('Missing required field');

      expect(error.httpStatus).toBe(400);
      expect(error.code).toBe('invalid_request');
      expect(error.message).toBe('Missing required field');
      expect(error.retryable).toBe(false);
    });

    it('creates unauthorized error', () => {
      const error = RenderScreenshotError.unauthorized();

      expect(error.httpStatus).toBe(401);
      expect(error.code).toBe('unauthorized');
      expect(error.retryable).toBe(false);
    });

    it('creates rate limited error', () => {
      const error = RenderScreenshotError.rateLimited(30);

      expect(error.httpStatus).toBe(429);
      expect(error.code).toBe('rate_limited');
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(30);
    });

    it('creates rate limited error without retryAfter', () => {
      const error = RenderScreenshotError.rateLimited();

      expect(error.httpStatus).toBe(429);
      expect(error.retryAfter).toBeUndefined();
    });

    it('creates timeout error', () => {
      const error = RenderScreenshotError.timeout();

      expect(error.httpStatus).toBe(408);
      expect(error.code).toBe('timeout');
      expect(error.retryable).toBe(true);
    });

    it('creates internal error with custom message', () => {
      const error = RenderScreenshotError.internal('Database connection failed');

      expect(error.httpStatus).toBe(500);
      expect(error.code).toBe('internal_error');
      expect(error.message).toBe('Database connection failed');
      expect(error.retryable).toBe(true);
    });

    it('creates internal error with default message', () => {
      const error = RenderScreenshotError.internal();

      expect(error.message).toBe('An internal error occurred');
    });
  });
});
