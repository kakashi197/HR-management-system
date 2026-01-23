const pool = require('../config/database');

// Apply for leave
const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate, remarks } = req.body;

    // Validate required fields
    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Type, start date and end date are required'
      });
    }

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const [usedLeaves] = await pool.execute(
      `SELECT SUM(days) as total FROM leaves 
       WHERE user_id = ? AND type = ? AND status = 'Approved' 
       AND YEAR(start_date) = ?`,
      [userId, type, currentYear]
    );

    const usedDays = usedLeaves[0].total || 0;
    const maxDays = type === 'Paid' ? 15 : type === 'Sick' ? 10 : 0;

    if (type !== 'Unpaid' && usedDays + days > maxDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${type} leave balance. Remaining: ${maxDays - usedDays} days`
      });
    }

    // Check for overlapping leaves
    const [overlapping] = await pool.execute(
      `SELECT * FROM leaves 
       WHERE user_id = ? AND status != 'Rejected' 
       AND ((start_date BETWEEN ? AND ?) 
       OR (end_date BETWEEN ? AND ?) 
       OR (? BETWEEN start_date AND end_date) 
       OR (? BETWEEN start_date AND end_date))`,
      [userId, startDate, endDate, startDate, endDate, startDate, endDate]
    );

    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Leave request overlaps with existing approved/pending leave'
      });
    }

    // Create leave request
    const [result] = await pool.execute(
      `INSERT INTO leaves (user_id, type, start_date, end_date, days, remarks) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, startDate, endDate, days, remarks || '']
    );

    // Get employee details
    const [user] = await pool.execute(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );

    // Create notification for admin
    const admins = await pool.execute(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    // Send notification to all admins
    for (const admin of admins[0]) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES (?, ?, ?, 'Leave')`,
        [
          admin.id,
          'New Leave Request',
          `${user[0].name || 'Employee'} has submitted a ${type} leave request for ${days} days (${startDate} to ${endDate})`,
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leaveId: result.insertId,
      days: days
    });

  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get my leaves
const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type, year } = req.query;

    let query = 'SELECT * FROM leaves WHERE user_id = ?';
    let params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (year) {
      query += ' AND YEAR(start_date) = ?';
      params.push(year);
    }

    query += ' ORDER BY created_at DESC';

    const [leaves] = await pool.execute(query, params);

    res.json({
      success: true,
      leaves,
      count: leaves.length
    });

  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get leave balance
const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const [leaves] = await pool.execute(
      `SELECT type, SUM(days) as total 
       FROM leaves 
       WHERE user_id = ? AND status = 'Approved' AND YEAR(start_date) = ?
       GROUP BY type`,
      [userId, currentYear]
    );

    const balances = {
      Paid: 15,
      Sick: 10,
      Unpaid: 0
    };

    leaves.forEach(leave => {
      if (balances[leave.type] !== undefined) {
        balances[leave.type] -= leave.total;
        if (balances[leave.type] < 0) balances[leave.type] = 0;
      }
    });

    res.json({
      success: true,
      balances,
      year: currentYear
    });

  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all leaves (admin)
// Get all leaves (admin)
const getAllLeaves = async (req, res) => {
  try {
    const { status, type, department, startDate, endDate, search } = req.query;

    let query = `
      SELECT 
        l.id,
        l.type,
        l.start_date as startDate,
        l.end_date as endDate,
        l.days,
        l.remarks,
        l.status,
        l.created_at as createdAt,
        u.name as employeeName,
        u.employee_id as employeeId,
        u.department,
        u.profile_picture,
        a.name as approvedByName
      FROM leaves l 
      JOIN users u ON l.user_id = u.id
      LEFT JOIN users a ON l.approved_by = a.id
      WHERE 1=1
    `;
    
    const params = [];

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND l.type = ?';
      params.push(type);
    }

    if (department) {
      query += ' AND u.department = ?';
      params.push(department);
    }

    if (startDate) {
      query += ' AND l.start_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND l.end_date <= ?';
      params.push(endDate);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.employee_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY l.created_at DESC';

    const [leaves] = await pool.execute(query, params);

    // Get statistics
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN type = 'Paid' THEN 1 END) as paid,
        COUNT(CASE WHEN type = 'Sick' THEN 1 END) as sick,
        COUNT(CASE WHEN type = 'Unpaid' THEN 1 END) as unpaid
      FROM leaves
    `);

    res.json({
      success: true,
      leaves,
      stats: stats || {}
    });

  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Approve leave
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Get leave details
    const [leaves] = await pool.execute(
      `SELECT l.*, u.name as employee_name, u.id as employee_id 
       FROM leaves l 
       JOIN users u ON l.user_id = u.id 
       WHERE l.id = ?`,
      [id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    const leave = leaves[0];

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    // Update leave status
    await pool.execute(
      'UPDATE leaves SET status = "Approved", approved_by = ?, approved_at = NOW() WHERE id = ?',
      [adminId, id]
    );

    // Create notification for employee
    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, ?, ?, 'Leave')`,
      [
        leave.employee_id,
        'Leave Request Approved',
        `Your ${leave.type} leave request for ${leave.days} days (${leave.start_date} to ${leave.end_date}) has been approved`,
      ]
    );

    res.json({
      success: true,
      message: 'Leave approved successfully'
    });

  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reject leave
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get leave details
    const [leaves] = await pool.execute(
      `SELECT l.*, u.name as employee_name, u.id as employee_id 
       FROM leaves l 
       JOIN users u ON l.user_id = u.id 
       WHERE l.id = ?`,
      [id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    const leave = leaves[0];

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    // Update leave status with reason
    const newRemarks = leave.remarks ? 
      `${leave.remarks} | Rejection Reason: ${reason}` : 
      `Rejection Reason: ${reason}`;
    
    await pool.execute(
      'UPDATE leaves SET status = "Rejected", approved_by = ?, approved_at = NOW(), remarks = ? WHERE id = ?',
      [adminId, newRemarks, id]
    );

    // Create notification for employee
    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, ?, ?, 'Leave')`,
      [
        leave.employee_id,
        'Leave Request Rejected',
        `Your ${leave.type} leave request for ${leave.days} days has been rejected. Reason: ${reason}`,
      ]
    );

    res.json({
      success: true,
      message: 'Leave rejected successfully'
    });

  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Bulk approve/reject leaves
const bulkLeaveAction = async (req, res) => {
  try {
    const { leaveIds, action, reason } = req.body;
    const adminId = req.user.id;

    if (!leaveIds || !Array.isArray(leaveIds) || leaveIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No leave requests selected'
      });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    if (action === 'reject' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get all leaves
    const placeholders = leaveIds.map(() => '?').join(',');
    const [leaves] = await pool.execute(
      `SELECT l.*, u.name as employee_name, u.id as employee_id 
       FROM leaves l 
       JOIN users u ON l.user_id = u.id 
       WHERE l.id IN (${placeholders}) AND l.status = 'Pending'`,
      leaveIds
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending leave requests found'
      });
    }

    // Update all leaves
    const status = action === 'approve' ? 'Approved' : 'Rejected';
    await pool.execute(
      `UPDATE leaves SET status = ?, approved_by = ?, approved_at = NOW() 
       WHERE id IN (${placeholders})`,
      [status, adminId, ...leaveIds]
    );

    // Create notifications for each employee
    for (const leave of leaves) {
      const newRemarks = action === 'reject' && leave.remarks ? 
        `${leave.remarks} | Rejection Reason: ${reason}` : 
        leave.remarks;
      
      if (action === 'reject') {
        await pool.execute(
          'UPDATE leaves SET remarks = ? WHERE id = ?',
          [newRemarks || `Rejection Reason: ${reason}`, leave.id]
        );
      }

      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES (?, ?, ?, 'Leave')`,
        [
          leave.employee_id,
          `Leave Request ${status}`,
          `Your ${leave.type} leave request for ${leave.days} days has been ${action === 'approve' ? 'approved' : 'rejected'}${action === 'reject' ? `. Reason: ${reason}` : ''}`,
        ]
      );
    }

    res.json({
      success: true,
      message: `${leaves.length} leave requests ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('Bulk leave action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cancel my leave (employee)
const cancelMyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [leaves] = await pool.execute(
      'SELECT * FROM leaves WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    const leave = leaves[0];

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leaves can be cancelled'
      });
    }

    // Cancel the leave
    await pool.execute(
      'UPDATE leaves SET status = "Cancelled" WHERE id = ?',
      [id]
    );

    // Create notification for admin
    const admins = await pool.execute(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    const [user] = await pool.execute(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );

    for (const admin of admins[0]) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES (?, ?, ?, 'Leave')`,
        [
          admin.id,
          'Leave Request Cancelled',
          `${user[0].name} has cancelled their ${leave.type} leave request`,
        ]
      );
    }

    res.json({
      success: true,
      message: 'Leave cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveBalance,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  bulkLeaveAction,
  cancelMyLeave
};