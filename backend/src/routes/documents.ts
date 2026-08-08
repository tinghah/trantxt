import { Router } from 'express';
import { documentController } from '../controllers/documentController';
import { authMiddleware } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/upload', uploadRateLimiter, upload.array('files', 10), (req, res) =>
  documentController.uploadDocuments(req, res)
);
router.get('/', (req, res) => documentController.getDocuments(req, res));
router.get('/:id', (req, res) => documentController.getDocument(req, res));
router.delete('/:id', (req, res) => documentController.deleteDocument(req, res));

export default router;
