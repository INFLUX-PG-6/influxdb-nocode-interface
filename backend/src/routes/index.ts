import { Router } from 'express';
import authRoutes from './auth';
import dataSourceRoutes from './dataSource';
import queryRoutes from './query';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'InfluxDB No-Code API is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Data source routes
router.use('/datasource', dataSourceRoutes);

// Query routes
router.use('/query', queryRoutes);

export default router;
