const pool = require('../config/database');

const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Attendance this month
    const [[attendance]] = await pool.execute(
      `SELECT COUNT(*) as count FROM attendance 
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = 'Present'`,
      [userId, currentMonth, currentYear]
    );

    // Pending leaves
    const [[leaves]] = await pool.execute(
      `SELECT COUNT(*) as count FROM leaves 
       WHERE user_id = ? AND status = 'Pending'`,
      [userId]
    );

    // Today's attendance status
    const [[todayAttendance]] = await pool.execute(
      `SELECT status FROM attendance WHERE user_id = ? AND date = ?`,
      [userId, today]
    );

    // Recent leaves
    const [recentLeaves] = await pool.execute(
      `SELECT type, start_date, end_date, status 
       FROM leaves WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 3`,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        attendance: attendance.count || 0,
        leaveRequests: leaves.count || 0,
        upcomingLeaves: 0,
        todayStatus: todayAttendance.length > 0 ? todayAttendance[0].status : 'Not Marked'
      },
      recentLeaves
    });

  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total employees
    const [[employees]] = await pool.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'employee'"
    );

    // Pending leaves
    const [[pendingLeaves]] = await pool.execute(
      "SELECT COUNT(*) as count FROM leaves WHERE status = 'Pending'"
    );

    // Today's attendance
    const [[todayAttendance]] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as count FROM attendance 
       WHERE date = ? AND status = 'Present'`,
      [today]
    );

    // Recent leaves for approval
    const [recentLeaves] = await pool.execute(
      `SELECT l.*, u.name, u.employee_id 
       FROM leaves l 
       JOIN users u ON l.user_id = u.id 
       WHERE l.status = 'Pending' 
       ORDER BY l.created_at DESC LIMIT 5`
    );

    // Recent registrations
    const [recentRegistrations] = await pool.execute(
      `SELECT name, email, employee_id, created_at 
       FROM users 
       WHERE role = 'employee' 
       ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalEmployees: employees.count || 0,
        pendingLeaves: pendingLeaves.count || 0,
        todaysAttendance: todayAttendance.count || 0,
        payrollProcessed: 0
      },
      recentLeaves,
      recentRegistrations
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getEmployeeDashboard,
  getAdminDashboard
};