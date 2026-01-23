const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Admin routes
router.get('/employees', authMiddleware, adminMiddleware, userController.getAllEmployees);
router.get('/employees/stats', authMiddleware, adminMiddleware, userController.getEmployeeStats);
router.get('/employee/:id', authMiddleware, adminMiddleware, userController.getEmployeeDetails);
router.put('/employee/:id', authMiddleware, adminMiddleware, userController.updateEmployee);
router.post('/employee/:id/documents', authMiddleware, adminMiddleware, userController.addDocument);
router.delete('/employee/:id', authMiddleware, adminMiddleware, userController.deleteEmployee);

module.exports = router;