const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const payrollController = require('../controllers/payrollController');

// Employee routes
router.get('/my', authMiddleware, payrollController.getMyPayroll);
router.get('/slip/:id', authMiddleware, payrollController.getPayrollSlip);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, payrollController.getAllPayroll);
router.post('/create',
  authMiddleware,
  adminMiddleware,
  [
    body('userId').isInt().withMessage('User ID required'),
    body('monthYear').matches(/^\d{4}-\d{2}$/).withMessage('Month format: YYYY-MM'),
    body('basicSalary').isDecimal().withMessage('Valid basic salary required'),
    body('allowances').optional().isDecimal(),
    body('deductions').optional().isDecimal(),
    body('bonus').optional().isDecimal()
  ],
  validateRequest,
  payrollController.createPayroll
);
router.put('/:id/status', authMiddleware, adminMiddleware, payrollController.updatePayrollStatus);

module.exports = router;