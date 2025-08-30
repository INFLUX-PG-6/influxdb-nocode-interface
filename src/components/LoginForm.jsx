import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Storage,
  Business,
  Link as LinkIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const LoginForm = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    url: import.meta.env.VITE_INFLUXDB_URL || 'http://localhost:8086',
    token: '',
    org: import.meta.env.VITE_DEFAULT_ORG || ''
  });
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load saved form data on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('influxdb_last_url');
    const savedOrg = localStorage.getItem('influxdb_last_org');
    
    setFormData(prev => ({
      ...prev,
      url: savedUrl || import.meta.env.VITE_INFLUXDB_URL || 'http://localhost:8086',
      org: savedOrg || import.meta.env.VITE_DEFAULT_ORG || ''
    }));
  }, []);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    
    // Form validation
    if (!formData.url || !formData.token || !formData.org) {
      setError('All fields are required');
      return;
    }

    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL (e.g., http://localhost:8086)');
      return;
    }

    if (formData.token.length < 10) {
      setError('API token appears to be too short. Please check your token.');
      return;
    }

    const result = await login(formData.url, formData.token, formData.org);
    
    if (!result.success) {
      setError(result.error);
    } else {
      // Save URL and org for next time (but not the token for security)
      localStorage.setItem('influxdb_last_url', formData.url);
      localStorage.setItem('influxdb_last_org', formData.org);
      setSuccess('Successfully connected to InfluxDB! Redirecting...');
    }
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: { xs: 3, sm: 4 }, width: '100%', maxWidth: 500 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Storage sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              InfluxDB Interface
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Connect to your InfluxDB instance to start building queries without code
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                fullWidth
                id="url"
                label="InfluxDB URL"
                name="url"
                value={formData.url}
                onChange={handleChange('url')}
                placeholder="http://localhost:8086"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="org"
                label="Organization"
                name="org"
                value={formData.org}
                onChange={handleChange('org')}
                placeholder="my-org"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                fullWidth
                name="token"
                label="API Token"
                type={showToken ? 'text' : 'password'}
                id="token"
                value={formData.token}
                onChange={handleChange('token')}
                placeholder="Your InfluxDB API token"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle token visibility"
                        onClick={toggleTokenVisibility}
                        edge="end"
                      >
                        {showToken ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Connect to InfluxDB'
                )}
              </Button>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                  <strong>Need help?</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.875rem' }}>
                  • Ensure InfluxDB is running on the specified URL<br />
                  • Create an API token in InfluxDB with read permissions<br />
                  • Use the exact organization name from your InfluxDB setup<br />
                  • Default URL is usually http://localhost:8086
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginForm;
