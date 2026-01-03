const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

// Employee routes
router.post('/checkin', authMiddleware, attendanceController.checkIn);
router.post('/checkout', authMiddleware, attendanceController.checkOut);
router.get('/my', authMiddleware, attendanceController.getMyAttendance);
router.get('/today', authMiddleware, attendanceController.getTodayAttendance);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, attendanceController.getAllAttendance);
router.get('/employee/:id', authMiddleware, adminMiddleware, attendanceController.getEmployeeAttendance);

module.exports = router;