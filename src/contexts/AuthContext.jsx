import React, { useState, useEffect } from 'react';
import { InfluxDB } from '@influxdata/influxdb-client';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [influxClient, setInfluxClient] = useState(null);

  useEffect(() => {
    // Check for existing authentication on app load
    const savedAuth = localStorage.getItem('influxdb_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setUser(authData);
        const client = new InfluxDB({
          url: authData.url,
          token: authData.token
        });
        setInfluxClient(client);
      } catch (error) {
        console.error('Failed to restore authentication:', error);
        localStorage.removeItem('influxdb_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (url, token, org) => {
    try {
      setLoading(true);
      
      // Create InfluxDB client
      const client = new InfluxDB({ url, token });
      
      // Test connection by trying to list buckets
      const bucketsAPI = client.getBucketsAPI();
      await bucketsAPI.getBuckets({ org });
      
      // If successful, save authentication
      const authData = { url, token, org };
      setUser(authData);
      setInfluxClient(client);
      localStorage.setItem('influxdb_auth', JSON.stringify(authData));
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Authentication failed';
      
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to InfluxDB server. Please check the URL and ensure InfluxDB is running.';
      } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
        errorMessage = 'Invalid API token. Please check your token and try again.';
      } else if (error.message.includes('organization') || error.message.includes('org')) {
        errorMessage = 'Organization not found. Please check the organization name.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your network and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setInfluxClient(null);
    localStorage.removeItem('influxdb_auth');
  };

  const value = {
    user,
    loading,
    influxClient,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
