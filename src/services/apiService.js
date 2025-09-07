// API Service Layer - Handles communication with backend API
// Uses Vite proxy in development, Netlify redirects to Railway in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.sessionToken = localStorage.getItem('session_token');
  }

  /**
   * Generic request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add session token to headers if available
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
      
      // Clear local session token on 401 error
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
   * Set session token
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
   * Clear session
   */
  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem('session_token');
  }

  /**
   * Get current session token
   */
  getSessionToken() {
    return this.sessionToken;
  }

  // ========== Authentication APIs ==========

  /**
   * Connect to InfluxDB
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
   * Check session status
   */
  async getAuthStatus() {
    return await this.request('/auth/status');
  }

  /**
   * Refresh session
   */
  async refreshSession() {
    return await this.request('/auth/refresh', {
      method: 'POST'
    });
  }

  /**
   * Logout
   */
  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST'
    });
    
    // Clear local session regardless of API call success
    this.clearSession();
    
    return response;
  }

  /**
   * Get connection info
   */
  async getConnectionInfo() {
    return await this.request('/auth/info');
  }

  /**
   * Health check
   */
  async healthCheck() {
    return await this.request('/health');
  }

  // ========== Query APIs ==========

  /**
   * Execute Flux query
   */
  async executeQuery(query, limit = 100) {
    return await this.request('/query/execute', {
      method: 'POST',
      body: JSON.stringify({ query, limit })
    });
  }

  /**
   * Validate query syntax
   */
  async validateQuery(query) {
    return await this.request('/query/validate', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  /**
   * Get query templates
   */
  async getQueryTemplates() {
    return await this.request('/query/templates');
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;
