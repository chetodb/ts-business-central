/**
 * Base error class for all Business Central SDK errors.
 */
export class BusinessCentralError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'BusinessCentralError';
  }
}

/**
 * Thrown when an HTTP request to Business Central fails.
 */
export class HttpError extends BusinessCentralError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly statusText: string,
    public readonly body?: unknown,
  ) {
    super(message, `HTTP_${statusCode}`);
    this.name = 'HttpError';
  }
}

/**
 * Thrown when an OData-specific error is returned by Business Central.
 */
export class ODataError extends HttpError {
  constructor(
    message: string,
    statusCode: number,
    statusText: string,
    public readonly odataError?: { code: string; message: string },
  ) {
    super(message, statusCode, statusText, odataError);
    this.name = 'ODataError';
  }
}

/**
 * Thrown when authentication with Azure AD fails after all retries.
 */
export class AuthenticationError extends BusinessCentralError {
  constructor(message: string) {
    super(message, 'AUTH_FAILED');
    this.name = 'AuthenticationError';
  }
}
