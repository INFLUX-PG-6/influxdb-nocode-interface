// API服务层 - 处理与后端API的通信
// 在开发环境使用Vite代理，生产环境使用Netlify重定向到Railway
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.sessionToken = localStorage.getItem('session_token');
  }

  /**
   * 通用请求方法
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // 如果有会话Token，添加到请求头
    if (this.sessionToken) {
      defaultOptions.headers.Authorization = `Bearer ${this.sessionToken}`;
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      
      // 如果是401错误，清除本地会话Token
      if (response.status === 401) {
        this.clearSession();
      }
      
      return {
        success: data.success,
        data: data.data || data,
        error: data.error,
        status: response.status
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        status: 0
      };
    }
  }

  /**
   * 设置会话Token
   */
  setSessionToken(token) {
    this.sessionToken = token;
    if (token) {
      localStorage.setItem('session_token', token);
    } else {
      localStorage.removeItem('session_token');
    }
  }

  /**
   * 清除会话
   */
  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem('session_token');
  }

  /**
   * 获取当前会话Token
   */
  getSessionToken() {
    return this.sessionToken;
  }

  // ========== 认证相关API ==========

  /**
   * 连接InfluxDB
   */
  async connect(credentials) {
    const response = await this.request('/auth/connect', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success && response.data.sessionToken) {
      this.setSessionToken(response.data.sessionToken);
    }

    return response;
  }

  /**
   * 检查会话状态
   */
  async getAuthStatus() {
    return await this.request('/auth/status');
  }

  /**
   * 刷新会话
   */
  async refreshSession() {
    return await this.request('/auth/refresh', {
      method: 'POST'
    });
  }

  /**
   * 登出
   */
  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST'
    });
    
    // 无论API调用是否成功，都清除本地会话
    this.clearSession();
    
    return response;
  }

  /**
   * 获取连接信息
   */
  async getConnectionInfo() {
    return await this.request('/auth/info');
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    return await this.request('/health');
  }
}

// 创建单例实例
export const apiService = new ApiService();
export default apiService;
