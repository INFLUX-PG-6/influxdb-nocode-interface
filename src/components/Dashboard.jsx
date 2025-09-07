import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  TextField,
  Alert
} from '@mui/material';
import {
  Logout,
  Storage,
  QueryBuilder,
  Timeline,
  Settings,
  Explore,
  PlayArrow,
  Code
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import DataSourceBrowser from './DataSourceBrowser';
import QueryResult from './QueryResult';

const Dashboard = () => {
  const { user, logout, apiService } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDataSourceSelection = (selection) => {
    setSelectedDataSource(selection);
    
    // Auto-generate query
    if (selection) {
      const generatedQuery = `from(bucket: "${selection.bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "${selection.measurement}")
  |> filter(fn: (r) => r._field == "${selection.field}")`;
      
      setCurrentQuery(generatedQuery);
    }
  };

  const handleRunQuery = async () => {
    if (!currentQuery.trim()) {
      setQueryError('Please enter a query');
      return;
    }

    try {
      setQueryLoading(true);
      setQueryError('');
      
      const response = await apiService.executeQuery(currentQuery);
      
      if (response.success) {
        setQueryResult(response.data);
      } else {
        setQueryError(response.error || 'Query execution failed');
      }
    } catch (error) {
      setQueryError('Network error while executing query');
    } finally {
      setQueryLoading(false);
    }
  };

  const features = [
    {
      title: 'Visual Query Builder',
      description: 'Build InfluxDB queries with drag-and-drop interface',
      icon: <QueryBuilder sx={{ fontSize: 40 }} />,
      status: 'Coming Soon'
    },
    {
      title: 'Data Visualization',
      description: 'Create beautiful charts and trends from your data',
      icon: <Timeline sx={{ fontSize: 40 }} />,
      status: 'Coming Soon'
    },
    {
      title: 'Custom Data Organization',
      description: 'Organize data with custom hierarchies beyond buckets and measurements',
      icon: <Storage sx={{ fontSize: 40 }} />,
      status: 'Coming Soon'
    },
    {
      title: 'Grafana Integration',
      description: 'Save and edit visualizations directly in Grafana',
      icon: <Settings sx={{ fontSize: 40 }} />,
      status: 'Coming Soon'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Storage sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            InfluxDB No-Code Interface
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Connected to: {user?.org}
          </Typography>
          <Button 
            color="inherit" 
            onClick={logout}
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            InfluxDB No-Code Interface
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Successfully connected to your InfluxDB instance. Explore your data and build queries visually.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label={`Organization: ${user?.org}`} color="primary" sx={{ mr: 1 }} />
            <Chip label={`URL: ${user?.url}`} variant="outlined" />
          </Box>
        </Paper>

        {/* Tab Navigation */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab icon={<Explore />} label="Data Explorer" />
            <Tab icon={<QueryBuilder />} label="Query Builder" />
            <Tab icon={<Timeline />} label="Visualizations" />
            <Tab icon={<Settings />} label="Settings" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <DataSourceBrowser onSelectionChange={handleDataSourceSelection} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Query Editor */}
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      Flux Query Editor
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={handleRunQuery}
                      disabled={!currentQuery.trim() || queryLoading}
                    >
                      {queryLoading ? 'Running...' : 'Run Query'}
                    </Button>
                  </Box>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    placeholder="Enter your Flux query here or select a field from the data source browser..."
                    sx={{ 
                      fontFamily: 'monospace',
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                  
                  {selectedDataSource && (
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        icon={<Code />}
                        label={`${selectedDataSource.bucket}/${selectedDataSource.measurement}/${selectedDataSource.field}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                  
                  {queryError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {queryError}
                    </Alert>
                  )}
                </Paper>

                {/* Query Results */}
                <QueryResult 
                  data={queryResult}
                  loading={queryLoading}
                  error={queryError}
                  query={currentQuery}
                />
              </Box>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Visual Query Builder
            </Typography>
            <Typography color="text.secondary">
              Drag and drop interface for building Flux queries - Coming Soon!
            </Typography>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Data Visualizations  
            </Typography>
            <Typography color="text.secondary">
              Charts and graphs for your data - Coming Soon!
            </Typography>
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <Typography color="text.secondary">
              Configuration options - Coming Soon!
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
