import React from 'react';
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
  Chip
} from '@mui/material';
import {
  Logout,
  Storage,
  QueryBuilder,
  Timeline,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

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
            Welcome to InfluxDB No-Code Interface
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Successfully connected to your InfluxDB instance. You can now start building queries and visualizations without writing code.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label={`Organization: ${user?.org}`} color="primary" sx={{ mr: 1 }} />
            <Chip label={`URL: ${user?.url}`} variant="outlined" />
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h6" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>
                  <Chip 
                    label={feature.status} 
                    size="small" 
                    color="warning" 
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Connection Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>URL:</strong> {user?.url}<br />
            <strong>Organization:</strong> {user?.org}<br />
            <strong>Status:</strong> Connected and authenticated
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
