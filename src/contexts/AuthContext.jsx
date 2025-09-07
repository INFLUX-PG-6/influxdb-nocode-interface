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
          // Verify if existing session is still valid
          const statusResponse = await apiService.getAuthStatus();
          
          if (statusResponse.success) {
            // Session valid, restore user state
            const infoResponse = await apiService.getConnectionInfo();
            if (infoResponse.success) {
              setUser({
                org: infoResponse.data.org,
                url: infoResponse.data.url,
                connected: infoResponse.data.connected
              });
            }
          } else {
            // Session invalid, clear local data
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
      
      // Use API service to connect to InfluxDB
      const response = await apiService.connect({ url, token, org });
      
      if (response.success) {
        // Connection successful, set user state
        setUser({
          org: response.data.user.org,
          url: response.data.user.url,
          permissions: response.data.user.permissions
        });
        
        return { success: true };
      } else {
        // Connection failed
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
      // Call API logout
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    // Provide API service instance for other components
    apiService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
