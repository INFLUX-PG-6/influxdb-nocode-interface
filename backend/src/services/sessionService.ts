import { v4 as uuidv4 } from 'uuid';
import { SessionData, InfluxDBCredentials } from '../types';
import logger from '../utils/logger';

class SessionService {
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2小时

  constructor() {
    // 每30分钟清理一次过期会话
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 30 * 60 * 1000);
  }

  /**
   * Create new session
   */
  createSession(credentials: InfluxDBCredentials): string {
    const sessionId = uuidv4();
    const session: SessionData = {
      id: sessionId,
      credentials,
      createdAt: new Date(),
      lastAccessed: new Date()
    };

    this.sessions.set(sessionId, session);
    logger.info(`Session created: ${sessionId} for org: ${credentials.org}`);
    
    return sessionId;
  }

  /**
   * Get session数据
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // 检查会话是否过期
    if (this.isSessionExpired(session)) {
      this.sessions.delete(sessionId);
      logger.info(`Session expired and removed: ${sessionId}`);
      return null;
    }

    // 更新最后访问时间
    session.lastAccessed = new Date();
    return session;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      logger.info(`Session deleted: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * 检查会话是否过期
   */
  private isSessionExpired(session: SessionData): boolean {
    const now = new Date().getTime();
    const lastAccessed = session.lastAccessed.getTime();
    return (now - lastAccessed) > this.SESSION_TIMEOUT;
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date().getTime();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  /**
   * 获取活跃会话数量
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }
}

// 单例模式
export const sessionService = new SessionService();
