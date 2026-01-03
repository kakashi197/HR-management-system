const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Employee dashboard
router.get('/employee', authMiddleware, dashboardController.getEmployeeDashboard);

// Admin dashboard
router.get('/admin', authMiddleware, adminMiddleware, dashboardController.getAdminDashboard);

module.exports = router;