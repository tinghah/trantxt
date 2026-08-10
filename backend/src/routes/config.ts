import { Router } from 'express';
import { configController } from '../controllers/configController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Enabled languages for all authenticated users
router.get('/languages', authMiddleware, (req, res) =>
  configController.getEnabledLanguages(req, res)
);

// Available translation providers
router.get('/providers', authMiddleware, (req, res) =>
  configController.getAvailableProviders(req, res)
);

// User BYOK API keys
router.get('/user/api-keys', authMiddleware, (req, res) =>
  configController.getUserApiKeys(req, res)
);
router.post('/user/api-keys', authMiddleware, (req, res) =>
  configController.addUserApiKey(req, res)
);
router.delete('/user/api-keys/:id', authMiddleware, (req, res) =>
  configController.deleteUserApiKey(req, res)
);

// Admin-only: language management
router.get('/admin/languages', authMiddleware, adminMiddleware, (req, res) =>
  configController.getAllLanguages(req, res)
);
router.put('/admin/languages/:code', authMiddleware, adminMiddleware, (req, res) =>
  configController.updateLanguage(req, res)
);

// Admin-only: server-side API keys
router.get('/admin/translation-apis', authMiddleware, adminMiddleware, (req, res) =>
  configController.getServerApiKeys(req, res)
);
router.post('/admin/translation-apis', authMiddleware, adminMiddleware, (req, res) =>
  configController.addServerApiKey(req, res)
);
router.put('/admin/translation-apis/:id', authMiddleware, adminMiddleware, (req, res) =>
  configController.toggleServerApiKey(req, res)
);
router.delete('/admin/translation-apis/:id', authMiddleware, adminMiddleware, (req, res) =>
  configController.deleteServerApiKey(req, res)
);

// Admin-only: test Google connection
router.get('/admin/translation-apis/google/test', authMiddleware, adminMiddleware, (req, res) =>
  configController.testGoogleConnection(req, res)
);

export default router;
