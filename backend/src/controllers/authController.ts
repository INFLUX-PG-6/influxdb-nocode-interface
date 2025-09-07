import { Request, Response } from 'express';
import { influxService } from '../services/influxService';
import { sessionService } from '../services/sessionService';
import { AuthResponse, ApiResponse, InfluxDBCredentials } from '../types';
import logger from '../utils/logger';

/**
 * Connect to InfluxDB and create session
 */
export const connect = async (req: Request, res: Response) => {
  try {
    const { url, token, org }: InfluxDBCredentials = req.body;

    // Validate required fields
    if (!url || !token || !org) {
      const response: AuthResponse = {
        success: false,
        error: 'Missing required fields: url, token, and org are required'
      };
      return res.status(400).json(response);
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      const response: AuthResponse = {
        success: false,
        error: 'Invalid URL format'
      };
      return res.status(400).json(response);
    }

    // Token length validation
    if (token.length < 10) {
      const response: AuthResponse = {
        success: false,
        error: 'API token appears to be too short'
      };
      return res.status(400).json(response);
    }

    const credentials: InfluxDBCredentials = { url, token, org };

    // Test InfluxDB connection
    const connectionResult = await influxService.testConnection(credentials);
    
    if (!connectionResult.success) {
      const response: AuthResponse = {
        success: false,
        error: connectionResult.error
      };
      return res.status(401).json(response);
    }

    // Create session
    const sessionToken = sessionService.createSession(credentials);

    const response: AuthResponse = {
      success: true,
      sessionToken,
      user: {
        org,
        url,
        permissions: ['read', 'write'] // Temporarily hardcoded, can fetch actual permissions from InfluxDB later
      }
    };

    logger.info(`Successful authentication for org: ${org}, url: ${url}`);
    res.json(response);

  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    const response: AuthResponse = {
      success: false,
      error: 'Authentication failed due to server error'
    };
    
    res.status(500).json(response);
  }
};

/**
 * Check session status
 */
export const getStatus = (req: Request, res: Response) => {
  // authenticateSession中间件已经验证了会话
  const session = req.session!;
  
  const response: ApiResponse = {
    success: true,
    data: {
      sessionId: session.id,
      org: session.credentials.org,
      url: session.credentials.url,
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed
    }
  };

  res.json(response);
};

/**
 * 刷新会话
 */
export const refresh = (req: Request, res: Response) => {
  const session = req.session!;
  
  // 会话在authenticateSession中间件中已经被刷新了
  const response: ApiResponse = {
    success: true,
    message: 'Session refreshed successfully',
    data: {
      lastAccessed: session.lastAccessed
    }
  };

  res.json(response);
};

/**
 * 登出 - 删除会话
 */
export const logout = (req: Request, res: Response) => {
  const session = req.session!;
  const deleted = sessionService.deleteSession(session.id);
  
  const response: ApiResponse = {
    success: true,
    message: deleted ? 'Logged out successfully' : 'Session not found'
  };

  logger.info(`User logged out: ${session.credentials.org}`);
  res.json(response);
};

/**
 * 获取连接信息（不包含敏感数据）
 */
export const getInfo = (req: Request, res: Response) => {
  const session = req.session!;
  
  const response: ApiResponse = {
    success: true,
    data: {
      org: session.credentials.org,
      url: session.credentials.url,
      connected: true,
      sessionAge: Date.now() - session.createdAt.getTime()
    }
  };

  res.json(response);
};
