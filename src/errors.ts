/**
 * Error codes returned by the RenderScreenshot API
 */
export type ErrorCode =
  | 'invalid_request'
  | 'invalid_url'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'timeout'
  | 'render_failed'
  | 'internal_error';

/**
 * Mapping of error codes to their retryable status
 */
const RETRYABLE_ERRORS = new Set<ErrorCode>([
  'rate_limited',
  'timeout',
  'render_failed',
  'internal_error',
]);

/**
 * Custom error class for RenderScreenshot API errors
 */
export class RenderScreenshotError extends Error {
  /** HTTP status code */
  readonly httpStatus: number;

  /** Error code from the API */
  readonly code: ErrorCode;

  /** Whether this error can be retried */
  readonly retryable: boolean;

  /** Seconds to wait before retrying (for rate limits) */
  readonly retryAfter?: number;

  constructor(httpStatus: number, code: ErrorCode, message: string, retryAfter?: number) {
    super(message);
    this.name = 'RenderScreenshotError';
    this.httpStatus = httpStatus;
    this.code = code;
    this.retryable = RETRYABLE_ERRORS.has(code);
    if (retryAfter !== undefined) {
      this.retryAfter = retryAfter;
    }

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, RenderScreenshotError);
    }
  }

  /**
   * Create an error from an API response
   */
  static fromResponse(
    httpStatus: number,
    body: { code?: string; message?: string; error?: string },
    retryAfter?: number
  ): RenderScreenshotError {
    const code = (body.code ?? 'internal_error') as ErrorCode;
    const message = body.message ?? body.error ?? 'An unknown error occurred';
    return new RenderScreenshotError(httpStatus, code, message, retryAfter);
  }

  /**
   * Create an invalid URL error
   */
  static invalidUrl(url: string): RenderScreenshotError {
    return new RenderScreenshotError(400, 'invalid_url', `Invalid URL provided: ${url}`);
  }

  /**
   * Create an invalid request error
   */
  static invalidRequest(message: string): RenderScreenshotError {
    return new RenderScreenshotError(400, 'invalid_request', message);
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(): RenderScreenshotError {
    return new RenderScreenshotError(401, 'unauthorized', 'Invalid or missing API key');
  }

  /**
   * Create a rate limited error
   */
  static rateLimited(retryAfter?: number): RenderScreenshotError {
    return new RenderScreenshotError(
      429,
      'rate_limited',
      'Rate limit exceeded. Please wait before making more requests.',
      retryAfter
    );
  }

  /**
   * Create a timeout error
   */
  static timeout(): RenderScreenshotError {
    return new RenderScreenshotError(408, 'timeout', 'Screenshot request timed out');
  }

  /**
   * Create an internal error
   */
  static internal(message?: string): RenderScreenshotError {
    return new RenderScreenshotError(
      500,
      'internal_error',
      message ?? 'An internal error occurred'
    );
  }
}
