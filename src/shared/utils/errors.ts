
export class BaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, "VALIDATION_ERROR", context);
  }
}

export class AIServiceError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, "AI_SERVICE_ERROR", context);
  }
}

export class NetworkError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, "NETWORK_ERROR", context);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, "AUTH_ERROR", context);
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, "RATE_LIMIT_ERROR", context);
  }
}

  return (
    error instanceof NetworkError ||
    error instanceof RateLimitError ||
    error.message.includes("timeout") ||
    error.message.includes("network")
  );
}

  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

  if (error instanceof BaseError) {
    return error.code;
  }
  return undefined;
}
