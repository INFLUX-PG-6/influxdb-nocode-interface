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
  Tab
} from '@mui/material';
import {
  Logout,
  Storage,
  QueryBuilder,
  Timeline,
  Settings,
  Explore
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import DataSourceBrowser from './DataSourceBrowser';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDataSource, setSelectedDataSource] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDataSourceSelection = (selection) => {
    setSelectedDataSource(selection);
    console.log('Selected data source:', selection);
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

        {/* 标签页导航 */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab icon={<Explore />} label="Data Explorer" />
            <Tab icon={<QueryBuilder />} label="Query Builder" />
            <Tab icon={<Timeline />} label="Visualizations" />
            <Tab icon={<Settings />} label="Settings" />
          </Tabs>
        </Paper>

        {/* 标签页内容 */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <DataSourceBrowser onSelectionChange={handleDataSourceSelection} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Data Preview
                </Typography>
                {selectedDataSource ? (
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      Selected: {selectedDataSource.type} - {selectedDataSource.field}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bucket: {selectedDataSource.bucket}<br/>
                      Measurement: {selectedDataSource.measurement}
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="caption" display="block">
                        Generated Flux Query:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                        {`from(bucket: "${selectedDataSource.bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "${selectedDataSource.measurement}")
  |> filter(fn: (r) => r._field == "${selectedDataSource.field}")`}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Select a field or tag from the data source browser to preview the data structure and generate queries.
                  </Typography>
                )}
              </Paper>
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
