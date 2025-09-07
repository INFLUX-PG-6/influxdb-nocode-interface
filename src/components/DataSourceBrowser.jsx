import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Storage as BucketIcon,
  Timeline as MeasurementIcon,
  Label as FieldIcon,
  LocalOffer as TagIcon,
  ExpandLess,
  ExpandMore,
  Folder,
  FolderOpen
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const DataSourceBrowser = ({ onSelectionChange }) => {
  const { apiService } = useAuth();
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBuckets, setExpandedBuckets] = useState({});
  const [expandedMeasurements, setExpandedMeasurements] = useState({});
  const [measurements, setMeasurements] = useState({});
  const [fields, setFields] = useState({});
  const [tags, setTags] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Load buckets
  useEffect(() => {
    const loadBuckets = async () => {
      try {
        setLoading(true);
        const response = await apiService.request('/datasource/buckets');
        
        if (response.success) {
          setBuckets(response.data || []);
        } else {
          setError(response.error || 'Failed to load buckets');
        }
      } catch (err) {
        setError('Network error while loading buckets');
      } finally {
        setLoading(false);
      }
    };

    loadBuckets();
  }, [apiService]);

  // Toggle bucket expand/collapse
  const handleBucketToggle = async (bucketName) => {
    const isExpanded = expandedBuckets[bucketName];
    
    setExpandedBuckets(prev => ({
      ...prev,
      [bucketName]: !isExpanded
    }));

    // If expanding and measurements not loaded yet
    if (!isExpanded && !measurements[bucketName]) {
      try {
        const response = await apiService.request(`/datasource/buckets/${bucketName}/measurements`);
        
        if (response.success) {
          setMeasurements(prev => ({
            ...prev,
            [bucketName]: response.data || []
          }));
        }
      } catch (err) {
        console.error('Failed to load measurements:', err);
      }
    }
  };

  // Toggle measurement expand/collapse
  const handleMeasurementToggle = async (bucketName, measurementName) => {
    const key = `${bucketName}/${measurementName}`;
    const isExpanded = expandedMeasurements[key];
    
    setExpandedMeasurements(prev => ({
      ...prev,
      [key]: !isExpanded
    }));

    // If expanding and fields/tags not loaded yet
    if (!isExpanded && !fields[key]) {
      try {
        const [fieldsResponse, tagsResponse] = await Promise.all([
          apiService.request(`/datasource/buckets/${bucketName}/measurements/${measurementName}/fields`),
          apiService.request(`/datasource/buckets/${bucketName}/measurements/${measurementName}/tags`)
        ]);
        
        if (fieldsResponse.success) {
          setFields(prev => ({
            ...prev,
            [key]: fieldsResponse.data || []
          }));
        }
        
        if (tagsResponse.success) {
          setTags(prev => ({
            ...prev,
            [key]: tagsResponse.data || []
          }));
        }
      } catch (err) {
        console.error('Failed to load fields/tags:', err);
      }
    }
  };

  // Select item
  const handleItemSelect = (type, bucketName, measurementName, fieldName) => {
    const selection = {
      type,
      bucket: bucketName,
      measurement: measurementName,
      field: fieldName
    };
    
    setSelectedItem(selection);
    
    if (onSelectionChange) {
      onSelectionChange(selection);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading data sources...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Data Sources
      </Typography>
      
      {buckets.length === 0 ? (
        <Typography color="text.secondary">
          No buckets found in your InfluxDB instance.
        </Typography>
      ) : (
        <List dense>
          {buckets.map((bucket) => (
            <Box key={bucket.name}>
              {/* Bucket */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleBucketToggle(bucket.name)}>
                  <ListItemIcon>
                    {expandedBuckets[bucket.name] ? <FolderOpen /> : <Folder />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={bucket.name}
                    secondary={`Bucket • ID: ${bucket.id}`}
                  />
                  {expandedBuckets[bucket.name] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              {/* Measurements */}
              <Collapse in={expandedBuckets[bucket.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {measurements[bucket.name]?.map((measurement) => (
                    <Box key={measurement} sx={{ ml: 2 }}>
                      <ListItem disablePadding>
                        <ListItemButton 
                          onClick={() => handleMeasurementToggle(bucket.name, measurement)}
                        >
                          <ListItemIcon>
                            <MeasurementIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={measurement}
                            secondary="Measurement"
                          />
                          {expandedMeasurements[`${bucket.name}/${measurement}`] ? 
                            <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                      </ListItem>

                      {/* Fields and Tags */}
                      <Collapse 
                        in={expandedMeasurements[`${bucket.name}/${measurement}`]} 
                        timeout="auto" 
                        unmountOnExit
                      >
                        <List component="div" disablePadding sx={{ ml: 2 }}>
                          {/* Fields */}
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <FieldIcon fontSize="small" />
                                  <Typography variant="subtitle2">Fields</Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {fields[`${bucket.name}/${measurement}`]?.map((field) => (
                            <ListItem key={field} sx={{ pl: 6 }}>
                              <ListItemButton 
                                onClick={() => handleItemSelect('field', bucket.name, measurement, field)}
                                selected={selectedItem?.type === 'field' && 
                                         selectedItem?.bucket === bucket.name && 
                                         selectedItem?.measurement === measurement && 
                                         selectedItem?.field === field}
                              >
                                <ListItemIcon>
                                  <FieldIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={field} />
                                <Chip label="Field" size="small" color="primary" variant="outlined" />
                              </ListItemButton>
                            </ListItem>
                          ))}

                          {/* Tags */}
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <TagIcon fontSize="small" />
                                  <Typography variant="subtitle2">Tags</Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {tags[`${bucket.name}/${measurement}`]?.map((tag) => (
                            <ListItem key={tag} sx={{ pl: 6 }}>
                              <ListItemButton 
                                onClick={() => handleItemSelect('tag', bucket.name, measurement, tag)}
                                selected={selectedItem?.type === 'tag' && 
                                         selectedItem?.bucket === bucket.name && 
                                         selectedItem?.measurement === measurement && 
                                         selectedItem?.field === tag}
                              >
                                <ListItemIcon>
                                  <TagIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={tag} />
                                <Chip label="Tag" size="small" color="secondary" variant="outlined" />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default DataSourceBrowser;
