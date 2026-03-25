/**
 * Error handling utilities for the application
 * Provides custom error types and user-friendly error messages
 */

export type ErrorType = 'api' | 'network' | 'validation' | 'unknown';

export class AppError extends Error {
  constructor(
    public message: string,
    public type: ErrorType = 'unknown',
    public originalError?: Error,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Parse error and return user-friendly message
 */
export const getErrorMessage = (error: unknown): { message: string; isRetryable: boolean } => {
  // Narrow unknown to an object shape that axios/network errors typically have
  const err = error as { response?: { status: number }; code?: string; message?: string } | null;

  // Handle axios errors
  if (err?.response) {
    const status = err.response.status;
    
    if (status === 404) {
      return {
        message: 'The requested data was not found. Please try a different country or region.',
        isRetryable: false,
      };
    }
    
    if (status === 429) {
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        isRetryable: true,
      };
    }
    
    if (status >= 500) {
      return {
        message: 'The data server is temporarily unavailable. Please try again later.',
        isRetryable: true,
      };
    }
    
    return {
      message: `Failed to fetch data (Error: ${status}). Please try again.`,
      isRetryable: true,
    };
  }
  
  // Handle network errors
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
    return {
      message: 'The request took too long. Please check your connection and try again.',
      isRetryable: true,
    };
  }
  
  if (!err?.response && err?.code) {
    return {
      message: 'Network connection error. Please check your internet connection and try again.',
      isRetryable: true,
    };
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: `Error: ${error.message}. Please try again.`,
      isRetryable: true,
    };
  }
  
  return {
    message: 'An unexpected error occurred. Please try again.',
    isRetryable: true,
  };
};

/**
 * Retry an async operation with exponential backoff
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        const delay = delayMs * Math.pow(2, i); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
