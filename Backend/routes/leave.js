const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const leaveController = require('../controllers/leaveController');

// Employee routes
router.get('/my', authMiddleware, leaveController.getMyLeaves);
router.get('/balance', authMiddleware, leaveController.getLeaveBalance);
router.post('/apply',
  authMiddleware,
  [
    body('type').isIn(['Paid', 'Sick', 'Unpaid']).withMessage('Invalid leave type'),
    body('startDate').isDate().withMessage('Valid start date required'),
    body('endDate').isDate().withMessage('Valid end date required'),
    body('remarks').optional().isString().isLength({ max: 500 })
  ],
  validateRequest,
  leaveController.applyLeave
);

// Cancel leave (employee)
router.put('/:id/cancel', authMiddleware, leaveController.cancelMyLeave);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, leaveController.getAllLeaves);
router.put('/:id/approve', authMiddleware, adminMiddleware, leaveController.approveLeave);
router.put('/:id/reject', 
  authMiddleware, 
  adminMiddleware,
  [
    body('reason').notEmpty().withMessage('Rejection reason is required')
  ],
  validateRequest,
  leaveController.rejectLeave
);
router.put('/bulk-action', 
  authMiddleware, 
  adminMiddleware,
  [
    body('leaveIds').isArray().withMessage('Leave IDs must be an array'),
    body('action').isIn(['approve', 'reject']).withMessage('Invalid action'),
    body('reason').if(body('action').equals('reject')).notEmpty().withMessage('Reason required for rejection')
  ],
  validateRequest,
  leaveController.bulkLeaveAction
);

module.exports = router;