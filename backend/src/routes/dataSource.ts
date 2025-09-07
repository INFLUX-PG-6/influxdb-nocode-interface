import { Router } from 'express';
import * as dataSourceController from '../controllers/dataSourceController';
import { authenticateSession } from '../middleware/auth';

const router = Router();

// 所有数据源相关路由都需要认证
router.use(authenticateSession);

// 获取buckets列表
router.get('/buckets', dataSourceController.getBuckets);

// 获取指定bucket的measurements
router.get('/buckets/:bucketName/measurements', dataSourceController.getMeasurements);

// 获取指定measurement的字段
router.get('/buckets/:bucketName/measurements/:measurement/fields', dataSourceController.getFields);

// 获取指定measurement的标签
router.get('/buckets/:bucketName/measurements/:measurement/tags', dataSourceController.getTags);

export default router;
