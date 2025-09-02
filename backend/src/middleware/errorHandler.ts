import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  };

  res.status(500).json(response);
};

/**
 * 404处理中间件
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  };

  res.status(404).json(response);
};
