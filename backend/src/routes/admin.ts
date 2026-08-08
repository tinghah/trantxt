import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, adminMiddleware);

// User management
router.get('/users', (req, res) => adminController.getAllUsers(req, res));
router.get('/users/:id', (req, res) => adminController.getUser(req, res));
router.put('/users/:id/approve', (req, res) => adminController.approveUser(req, res));
router.put('/users/:id/group', (req, res) => adminController.assignToGroup(req, res));

// Group management
router.post('/groups', (req, res) => adminController.createGroup(req, res));
router.get('/groups', (req, res) => adminController.getAllGroups(req, res));

// Translation management
router.get('/translations/pending', (req, res) => adminController.getPendingTranslations(req, res));
router.put('/translations/:id/approve', (req, res) => adminController.approveTranslation(req, res));
router.put('/translations/:id/reject', (req, res) => adminController.rejectTranslation(req, res));

// Analytics
router.get('/analytics/dashboard', (req, res) => adminController.getDashboard(req, res));

export default router;
