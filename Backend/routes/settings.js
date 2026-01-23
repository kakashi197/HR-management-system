const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

// Public routes
router.get('/company', settingsController.getCompanySettings);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, settingsController.getSettings);
router.put('/:key', authMiddleware, adminMiddleware, settingsController.updateSetting);

module.exports = router;