import { Router } from 'express';
import { translationController } from '../controllers/translationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', (req, res) => translationController.createTranslation(req, res));
router.post('/image', (req, res) => translationController.translateImage(req, res));
router.get('/:id', (req, res) => translationController.getTranslation(req, res));
router.get('/', (req, res) => translationController.getUserTranslations(req, res));
router.get('/:id/download', (req, res) => translationController.downloadTranslation(req, res));
router.get('/:id/image', (req, res) => translationController.downloadTranslatedImage(req, res));

export default router;
