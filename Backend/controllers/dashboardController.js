const pool = require('../config/database');

const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get all stats in one query
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM attendance 
         WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = 'Present') as attendance_count,
        (SELECT COUNT(*) FROM leaves 
         WHERE user_id = ? AND status = 'Pending') as pending_leaves,
        (SELECT COUNT(*) FROM leaves 
         WHERE user_id = ? AND start_date > CURDATE() AND status = 'Approved') as upcoming_leaves,
        (SELECT status FROM attendance WHERE user_id = ? AND date = ?) as today_status,
        (SELECT SUM(working_hours) FROM attendance 
         WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?) as total_hours
    `, [userId, currentMonth, currentYear, userId, userId, userId, today, userId, currentMonth, currentYear]);

    // Get recent leaves
    const [recentLeaves] = await pool.execute(`
      SELECT l.*, 
        u.name as employee_name,
        u.employee_id
      FROM leaves l
      LEFT JOIN users u ON l.approved_by = u.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
      LIMIT 3
    `, [userId]);

    // Get notifications
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications 
      WHERE user_id = ? AND is_read = FALSE
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    res.json({
      success: true,
      stats: {
        attendance: stats[0]?.attendance_count || 0,
        leaveRequests: stats[0]?.pending_leaves || 0,
        upcomingLeaves: stats[0]?.upcoming_leaves || 0,
        todayStatus: stats[0]?.today_status || 'Not Marked',
        totalHours: parseFloat(stats[0]?.total_hours || 0).toFixed(1)
      },
      recentLeaves,
      notifications
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

    // Get all stats in one query
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'employee' AND is_active = TRUE) as total_employees,
        (SELECT COUNT(*) FROM leaves WHERE status = 'Pending') as pending_leaves,
        (SELECT COUNT(DISTINCT user_id) FROM attendance WHERE date = ? AND status = 'Present') as todays_attendance,
        (SELECT COUNT(*) FROM payroll WHERE status = 'Paid' AND MONTH(month_year) = MONTH(CURDATE())) as payroll_processed,
        (SELECT COUNT(*) FROM users WHERE role = 'employee' AND is_active = FALSE) as inactive_employees,
        (SELECT COUNT(*) FROM notifications WHERE is_read = FALSE) as unread_notifications
    `, [today]);

    // Get recent leaves for approval with employee details
    const [recentLeaves] = await pool.execute(`
      SELECT l.*, 
        u.name as employee_name,
        u.employee_id,
        u.department,
        u.profile_picture
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      WHERE l.status = 'Pending'
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    // Get recent registrations
    const [recentRegistrations] = await pool.execute(`
      SELECT 
        id, name, email, employee_id, 
        department, position, created_at,
        DATE_FORMAT(created_at, '%Y-%m-%d') as join_date_formatted
      FROM users 
      WHERE role = 'employee'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Get department-wise employee count
    const [departmentStats] = await pool.execute(`
      SELECT 
        COALESCE(department, 'Not Assigned') as department,
        COUNT(*) as count
      FROM users 
      WHERE role = 'employee' AND is_active = TRUE
      GROUP BY department
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get attendance summary for today
    const [todayAttendance] = await pool.execute(`
      SELECT 
        a.*,
        u.name,
        u.employee_id,
        u.department,
        u.profile_picture
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.date = ?
      ORDER BY a.check_in DESC
      LIMIT 10
    `, [today]);

    res.json({
      success: true,
      stats: {
        totalEmployees: stats[0]?.total_employees || 0,
        pendingLeaves: stats[0]?.pending_leaves || 0,
        todaysAttendance: stats[0]?.todays_attendance || 0,
        payrollProcessed: stats[0]?.payroll_processed || 0,
        inactiveEmployees: stats[0]?.inactive_employees || 0,
        unreadNotifications: stats[0]?.unread_notifications || 0
      },
      recentLeaves,
      recentRegistrations,
      departmentStats,
      todayAttendance,
      todayDate: today
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get dashboard analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let dateFilter = '';
    
    if (period === 'week') {
      dateFilter = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateFilter = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (period === 'year') {
      dateFilter = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
    }

    // Attendance trend
    const [attendanceTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'Half-day' THEN 1 END) as half_day,
        COUNT(CASE WHEN status = 'Leave' THEN 1 END) as leave
      FROM attendance 
      ${dateFilter}
      GROUP BY date
      ORDER BY date
    `);

    // Leave trend
    const [leaveTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(start_date, '%Y-%m') as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected
      FROM leaves 
      WHERE start_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(start_date, '%Y-%m')
      ORDER BY month
    `);

    res.json({
      success: true,
      attendanceTrend,
      leaveTrend
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getEmployeeDashboard,
  getAdminDashboard,
  getAnalytics
};