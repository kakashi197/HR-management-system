const pool = require('../config/database');

const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate, remarks } = req.body;

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

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
        message: `Insufficient ${type} leave balance`
      });
    }

    // Create leave request
    const [result] = await pool.execute(
      `INSERT INTO leaves (user_id, type, start_date, end_date, days, remarks) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, startDate, endDate, days, remarks]
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted',
      leaveId: result.insertId
    });

  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = 'SELECT * FROM leaves WHERE user_id = ?';
    let params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [leaves] = await pool.execute(query, params);

    res.json({
      success: true,
      leaves
    });

  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

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
      balances[leave.type] -= leave.total;
      if (balances[leave.type] < 0) balances[leave.type] = 0;
    });

    res.json({
      success: true,
      balances
    });

  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT l.*, u.name, u.employee_id 
      FROM leaves l 
      JOIN users u ON l.user_id = u.id
    `;
    let params = [];

    if (status) {
      query += ' WHERE l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.created_at DESC';

    const [leaves] = await pool.execute(query, params);

    res.json({
      success: true,
      leaves
    });

  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE leaves SET status = "Approved", approved_by = ?, approved_at = NOW() WHERE id = ?',
      [req.user.id, id]
    );

    res.json({
      success: true,
      message: 'Leave approved'
    });

  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE leaves SET status = "Rejected", approved_by = ?, approved_at = NOW() WHERE id = ?',
      [req.user.id, id]
    );

    res.json({
      success: true,
      message: 'Leave rejected'
    });

  } catch (error) {
    console.error('Reject leave error:', error);
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
  rejectLeave
};