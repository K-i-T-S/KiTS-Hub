import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export const handleApiError = (error: unknown): { error: string; statusCode: number } => {
  if (error instanceof AppError) {
    logger.error('API Error', { statusCode: error.statusCode, message: error.message }, error);
    return {
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    logger.error('Unexpected Error', { message: error.message }, error);
    return {
      error: 'Internal server error',
      statusCode: 500,
    };
  }

  logger.error('Unknown Error', { error });
  return {
    error: 'Internal server error',
    statusCode: 500,
  };
};

export const asyncHandler = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      throw error;
    });
  };
};
