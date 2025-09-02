import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/sessionService';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * 认证中间件 - 验证会话Token
 */
export const authenticateSession = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse = {
      success: false,
      error: 'Missing or invalid authorization header'
    };
    return res.status(401).json(response);
  }

  const sessionToken = authHeader.substring(7); // 移除 'Bearer ' 前缀
  
  const session = sessionService.getSession(sessionToken);
  if (!session) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid or expired session'
    };
    return res.status(401).json(response);
  }

  // 将会话数据附加到请求对象
  req.session = session;
  
  logger.debug(`Authenticated session: ${session.id} for org: ${session.credentials.org}`);
  next();
};
