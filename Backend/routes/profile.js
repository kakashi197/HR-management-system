const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// Get profile
router.get('/', authMiddleware, profileController.getProfile);

// Update profile
router.put('/',
  authMiddleware,
  [
    body('phone').optional().isMobilePhone(),
    body('address').optional().isString(),
    body('emergencyContact').optional().isString()
  ],
  validateRequest,
  profileController.updateProfile
);

// Admin: Get all profiles
router.get('/all', authMiddleware, adminMiddleware, profileController.getAllProfiles);

// Admin: Update employee profile
router.put('/employee/:id',
  authMiddleware,
  adminMiddleware,
  profileController.updateEmployeeProfile
);

module.exports = router;