import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from './LoginForm';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <LoginForm />;
};

export default ProtectedRoute;
