// 认证相关类型定义
export interface InfluxDBCredentials {
  url: string;
  token: string;
  org: string;
}

export interface SessionData {
  id: string;
  credentials: InfluxDBCredentials;
  createdAt: Date;
  lastAccessed: Date;
}

export interface AuthResponse {
  success: boolean;
  sessionToken?: string;
  user?: {
    org: string;
    url: string;
    permissions?: string[];
  };
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Express扩展类型
declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
    }
  }
}
