/**
 * API-specific Error Handling
 * Provides specialized error handling for API calls
 */

import { errorHandler, EnhancedError, ErrorContext } from './errorHandler';
import { logger } from '@/shared/utils/logger';

export interface ApiErrorResponse {
  status: number;
  statusText: string;
  data?: any;
  headers?: Record<string, string>;
}

export interface ApiRetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError, attempt: number) => boolean;
  exponentialBackoff?: boolean;
}

export class ApiError extends EnhancedError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly response?: ApiErrorResponse;
  public readonly url?: string;
  public readonly method?: string;

  constructor(
    message: string,
    status: number,
    statusText: string = '',
    response?: ApiErrorResponse,
    context: ErrorContext & { url?: string; method?: string } = {}
  ) {
    const severity = ApiError.determineSeverity(status);
    const category = ApiError.determineCategory(status);
    const code = `API_ERROR_${status}`;

    super(message, code, severity, category, context, ApiError.isRecoverable(status));

    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.url = context.url;
    this.method = context.method;
  }

  static determineSeverity(status: number): 'low' | 'medium' | 'high' | 'critical' {
    if (status >= 500) return 'critical';
    if (status >= 400 && status < 500) return 'high';
    if (status >= 300) return 'medium';
    return 'low';
  }

  static determineCategory(status: number): string {
    if (status === 401 || status === 403) return 'auth';
    if (status === 404) return 'not_found';
    if (status === 422 || status === 400) return 'validation';
    if (status === 429) return 'rate_limit';
    if (status >= 500) return 'server_error';
    if (status >= 400) return 'client_error';
    return 'network';
  }

  static isRecoverable(status: number): boolean {
    // Authentication and validation errors are typically not recoverable
    if (status === 401 || status === 403 || status === 422 || status === 400) return false;
    // Rate limiting and server errors are recoverable
    if (status === 429 || status >= 500) return true;
    // 404 depends on context, but generally not recoverable
    if (status === 404) return false;
    return true;
  }
}

export class ApiErrorHandler {
  private defaultRetryConfig: ApiRetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    retryCondition: (error: ApiError, attempt: number) => {
      // Don't retry authentication errors
      if (error.status === 401 || error.status === 403) return false;
      // Don't retry validation errors
      if (error.status === 400 || error.status === 422) return false;
      // Don't retry 404s
      if (error.status === 404) return false;
      // Retry rate limits with longer delay
      if (error.status === 429) return attempt <= 2;
      // Retry server errors
      if (error.status >= 500) return attempt <= 3;
      // Retry network errors
      return attempt <= 2;
    }
  };

  async handleApiCall<T>(
    apiCall: () => Promise<T>,
    context: ErrorContext & { url?: string; method?: string } = {},
    retryConfig: ApiRetryConfig = {}
  ): Promise<T> {
    const config = { ...this.defaultRetryConfig, ...retryConfig };

    return errorHandler.retry(
      apiCall,
      {
        maxRetries: config.maxRetries,
        baseDelay: config.retryDelay,
        backoffFactor: config.exponentialBackoff ? 2 : 1,
        retryCondition: (error: Error, attempt: number) => {
          if (error instanceof ApiError) {
            return config.retryCondition!(error, attempt);
          }
          // For non-API errors, use default retry logic
          return attempt <= 2;
        }
      },
      context
    );
  }

  wrapFetchError(error: any, context: ErrorContext & { url?: string; method?: string } = {}): ApiError {
    // Handle fetch-specific errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ApiError(
        'Network connection failed',
        0,
        'Network Error',
        undefined,
        { ...context, networkError: true }
      );
    }

    // Handle timeout errors
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return new ApiError(
        'Request timed out',
        0,
        'Timeout',
        undefined,
        { ...context, timeout: true }
      );
    }

    // Handle response errors with status codes
    if (error.response) {
      const response: ApiErrorResponse = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      };

      let message = `API request failed with status ${error.response.status}`;
      if (error.response.data?.message) {
        message = error.response.data.message;
      } else if (error.response.data?.error) {
        message = error.response.data.error;
      }

      return new ApiError(
        message,
        error.response.status,
        error.response.statusText,
        response,
        context
      );
    }

    // Fallback for unknown errors
    return new ApiError(
      error.message || 'Unknown API error',
      0,
      'Unknown Error',
      undefined,
      context
    );
  }

  async enhancedFetch(
    url: string,
    options: RequestInit = {},
    retryConfig: ApiRetryConfig = {}
  ): Promise<Response> {
    const context = {
      url,
      method: options.method || 'GET',
      component: 'api'
    };

    try {
      const response = await this.handleApiCall(
        () => fetch(url, options),
        context,
        retryConfig
      );

      // Check if response is ok
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.clone().json();
        } catch {
          // If JSON parsing fails, use text
          try {
            errorData = await response.clone().text();
          } catch {
            errorData = null;
          }
        }

        const apiResponse: ApiErrorResponse = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          headers: Object.fromEntries(response.headers.entries())
        };

        let message = `HTTP ${response.status}: ${response.statusText}`;
        if (errorData?.message) {
          message = errorData.message;
        } else if (typeof errorData === 'string') {
          message = errorData;
        }

        throw new ApiError(
          message,
          response.status,
          response.statusText,
          apiResponse,
          context
        );
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw this.wrapFetchError(error, context);
    }
  }

  // Convenience methods for common HTTP methods
  async get(url: string, options: RequestInit = {}, retryConfig?: ApiRetryConfig): Promise<Response> {
    return this.enhancedFetch(url, { ...options, method: 'GET' }, retryConfig);
  }

  async post(url: string, body?: any, options: RequestInit = {}, retryConfig?: ApiRetryConfig): Promise<Response> {
    const requestOptions: RequestInit = {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (body) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    return this.enhancedFetch(url, requestOptions, retryConfig);
  }

  async put(url: string, body?: any, options: RequestInit = {}, retryConfig?: ApiRetryConfig): Promise<Response> {
    const requestOptions: RequestInit = {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (body) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    return this.enhancedFetch(url, requestOptions, retryConfig);
  }

  async delete(url: string, options: RequestInit = {}, retryConfig?: ApiRetryConfig): Promise<Response> {
    return this.enhancedFetch(url, { ...options, method: 'DELETE' }, retryConfig);
  }

  // JSON convenience methods
  async getJson<T>(url: string, options: RequestInit = {}, retryConfig?: ApiRetryConfig): Promise<T> {
    const response = await this.get(url, options, retryConfig);
    return response.json();
  }

  async postJson<T>(url: string, body?: any, options: RequestInit = {}, retryConfig?: ApiRetryConfig): Promise<T> {
    const response = await this.post(url, body, options, retryConfig);
    return response.json();
  }

  async putJson<T>(url: string, body?: any, options: RequestInit = {}, retryConfig?: ApiRetryConfig): Promise<T> {
    const response = await this.put(url, body, options, retryConfig);
    return response.json();
  }

  // Error reporting for API errors
  async reportApiError(error: ApiError, additionalContext: Record<string, any> = {}): Promise<void> {
    const context = {
      ...additionalContext,
      apiCall: {
        url: error.url,
        method: error.method,
        status: error.status,
        statusText: error.statusText,
        response: error.response
      }
    };

    await errorHandler.reportError(error, context);
  }

  // Check if an error is a specific type
  isNetworkError(error: any): boolean {
    return error instanceof ApiError && (error.status === 0 || error.context.networkError);
  }

  isTimeoutError(error: any): boolean {
    return error instanceof ApiError && error.context.timeout;
  }

  isAuthError(error: any): boolean {
    return error instanceof ApiError && (error.status === 401 || error.status === 403);
  }

  isValidationError(error: any): boolean {
    return error instanceof ApiError && (error.status === 400 || error.status === 422);
  }

  isServerError(error: any): boolean {
    return error instanceof ApiError && error.status >= 500;
  }

  isRateLimitError(error: any): boolean {
    return error instanceof ApiError && error.status === 429;
  }
}

// Export singleton instance
export const apiErrorHandler = new ApiErrorHandler();

// Export convenience functions
export const enhancedFetch = apiErrorHandler.enhancedFetch.bind(apiErrorHandler);
export const apiGet = apiErrorHandler.get.bind(apiErrorHandler);
export const apiPost = apiErrorHandler.post.bind(apiErrorHandler);
export const apiPut = apiErrorHandler.put.bind(apiErrorHandler);
export const apiDelete = apiErrorHandler.delete.bind(apiErrorHandler);
export const apiGetJson = apiErrorHandler.getJson.bind(apiErrorHandler);
export const apiPostJson = apiErrorHandler.postJson.bind(apiErrorHandler);
export const apiPutJson = apiErrorHandler.putJson.bind(apiErrorHandler);