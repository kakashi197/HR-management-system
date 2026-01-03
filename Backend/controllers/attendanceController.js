const pool = require('../config/database');

const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toTimeString().split(' ')[0];

    // Check if already checked in
    const [existing] = await pool.execute(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existing.length > 0 && existing[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE attendance SET check_in = ?, status = "Present" WHERE user_id = ? AND date = ?',
        [checkInTime, userId, today]
      );
    } else {
      await pool.execute(
        'INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, "Present")',
        [userId, today, checkInTime]
      );
    }

    res.json({
      success: true,
      message: 'Checked in successfully',
      time: checkInTime.substring(0, 5)
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toTimeString().split(' ')[0];

    // Get check-in time
    const [record] = await pool.execute(
      'SELECT check_in FROM attendance WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (record.length === 0 || !record[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Not checked in today'
      });
    }

    // Calculate working hours
    const checkIn = new Date(`${today}T${record[0].check_in}`);
    const checkOut = new Date();
    const hours = (checkOut - checkIn) / (1000 * 60 * 60);

    // Update record
    await pool.execute(
      'UPDATE attendance SET check_out = ?, working_hours = ? WHERE user_id = ? AND date = ?',
      [checkOutTime, hours.toFixed(2), userId, today]
    );

    res.json({
      success: true,
      message: 'Checked out successfully',
      workingHours: hours.toFixed(2)
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let query = 'SELECT * FROM attendance WHERE user_id = ?';
    let params = [userId];

    if (month) {
      query += ' AND MONTH(date) = MONTH(?) AND YEAR(date) = YEAR(?)';
      params.push(month, month);
    }

    query += ' ORDER BY date DESC';

    const [attendance] = await pool.execute(query, params);

    res.json({
      success: true,
      attendance
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [attendance] = await pool.execute(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    res.json({
      success: true,
      attendance: attendance[0] || null
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [attendance] = await pool.execute(
      `SELECT a.*, u.name, u.employee_id 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.date = ? 
       ORDER BY a.check_in`,
      [targetDate]
    );

    res.json({
      success: true,
      attendance
    });

  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;

    let query = 'SELECT * FROM attendance WHERE user_id = ?';
    let params = [id];

    if (month) {
      query += ' AND MONTH(date) = MONTH(?) AND YEAR(date) = YEAR(?)';
      params.push(month, month);
    }

    query += ' ORDER BY date DESC';

    const [attendance] = await pool.execute(query, params);

    res.json({
      success: true,
      attendance
    });

  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
  getAllAttendance,
  getEmployeeAttendance
};