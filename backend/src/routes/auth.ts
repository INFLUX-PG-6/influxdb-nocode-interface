import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateSession } from '../middleware/auth';

const router = Router();

// 公开路由 - 不需要认证
router.post('/connect', authController.connect);

// 需要认证的路由
router.get('/status', authenticateSession, authController.getStatus);
router.post('/refresh', authenticateSession, authController.refresh);
router.post('/logout', authenticateSession, authController.logout);
router.get('/info', authenticateSession, authController.getInfo);

export default router;
