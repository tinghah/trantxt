import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/profile', (req, res) => userController.getProfile(req, res));
router.put('/profile', (req, res) => userController.updateProfile(req, res));
router.get('/usage', (req, res) => userController.getUsage(req, res));
router.get('/quota', (req, res) => userController.getQuota(req, res));
router.get('/history', (req, res) => userController.getHistory(req, res));

export default router;
