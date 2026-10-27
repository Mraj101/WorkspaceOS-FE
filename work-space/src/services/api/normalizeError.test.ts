import { describe, expect, it } from 'vitest';
import { normalizeError } from './normalizeError';

describe('normalizeError', () => {
  it('maps network failures to a friendly message', () => {
    expect(normalizeError({ status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' })).toEqual({
      status: 'NETWORK_ERROR',
      message: expect.stringContaining('Unable to reach the server') as string,
    });
  });

  it('maps timeouts', () => {
    expect(normalizeError({ status: 'TIMEOUT_ERROR', error: 'AbortError' }).status).toBe('TIMEOUT');
  });

  it('uses the backend message, code and field errors when present', () => {
    const error = normalizeError({
      status: 422,
      data: {
        message: 'Validation failed',
        code: 'VALIDATION',
        errors: { name: ['Too short'], price: 'Required' },
      },
    });
    expect(error).toEqual({
      status: 422,
      message: 'Validation failed',
      code: 'VALIDATION',
      fieldErrors: { name: 'Too short', price: 'Required' },
    });
  });

  it('falls back to a status-based message for unknown bodies', () => {
    expect(normalizeError({ status: 403, data: '<html>Forbidden</html>' })).toEqual({
      status: 403,
      message: 'You do not have permission to perform this action.',
    });
    expect(normalizeError({ status: 503, data: null }).message).toMatch(
      /server encountered an error/,
    );
  });

  it('treats unparseable 5xx bodies as server errors', () => {
    expect(
      normalizeError({
        status: 'PARSING_ERROR',
        originalStatus: 502,
        data: 'Bad Gateway',
        error: 'SyntaxError',
      }).status,
    ).toBe(502);
  });
});
