import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.util';
import config from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'development' 
      ? err.message 
      : 'Internal server error',
  });
};

