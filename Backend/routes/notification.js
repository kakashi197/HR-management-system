const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// User routes
router.get('/', authMiddleware, notificationController.getUserNotifications);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// Admin routes
router.post('/broadcast', authMiddleware, adminMiddleware, notificationController.createNotification);

module.exports = router;