import { Router } from 'express';
import * as queryController from '../controllers/queryController';
import { authenticateSession } from '../middleware/auth';

const router = Router();

// 所有查询相关路由都需要认证
router.use(authenticateSession);

// 执行Flux查询
router.post('/execute', queryController.executeQuery);

// Validate query语法
router.post('/validate', queryController.validateQuery);

// 获取查询模板
router.get('/templates', queryController.getQueryTemplates);

export default router;
