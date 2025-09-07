import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// CORS配置 - 允许前端访问
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'https://influxdb-nocode-interface.netlify.app',
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// 日志中间件
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', routes);

// 错误处理中间件
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info(`🚀 InfluxDB No-Code API server is running on port ${PORT}`);
  logger.info(`📖 API Documentation: http://localhost:${PORT}/api/health`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
