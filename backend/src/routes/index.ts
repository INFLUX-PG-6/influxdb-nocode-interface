import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// 健康检查端点
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'InfluxDB No-Code API is running',
    timestamp: new Date().toISOString()
  });
});

// 认证相关路由
router.use('/auth', authRoutes);

export default router;
