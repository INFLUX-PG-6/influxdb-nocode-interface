import React, { useState, useEffect } from 'react';
import { AuthContext } from './auth';
import apiService from '../services/apiService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkExistingSession = async () => {
      const sessionToken = apiService.getSessionToken();
      
      if (sessionToken) {
        try {
          // 验证现有会话是否仍然有效
          const statusResponse = await apiService.getAuthStatus();
          
          if (statusResponse.success) {
            // 会话有效，恢复用户状态
            const infoResponse = await apiService.getConnectionInfo();
            if (infoResponse.success) {
              setUser({
                org: infoResponse.data.org,
                url: infoResponse.data.url,
                connected: infoResponse.data.connected
              });
            }
          } else {
            // 会话无效，清除本地数据
            apiService.clearSession();
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          apiService.clearSession();
        }
      }
      
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = async (url, token, org) => {
    try {
      setLoading(true);
      
      // 使用API服务连接InfluxDB
      const response = await apiService.connect({ url, token, org });
      
      if (response.success) {
        // 连接成功，设置用户状态
        setUser({
          org: response.data.user.org,
          url: response.data.user.url,
          permissions: response.data.user.permissions
        });
        
        return { success: true };
      } else {
        // 连接失败
        return { 
          success: false, 
          error: response.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      return { 
        success: false, 
        error: 'Network error. Please check your connection.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 调用API登出
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 无论API调用是否成功，都清除本地状态
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    // 提供API服务实例供其他组件使用
    apiService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
