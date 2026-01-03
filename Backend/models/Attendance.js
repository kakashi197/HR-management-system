class Attendance {
  static async create(data) {
    const pool = require('../config/database');
    const { userId, date, checkIn, status = 'Present' } = data;

    const [result] = await pool.execute(
      'INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, ?)',
      [userId, date, checkIn, status]
    );

    return result.insertId;
  }

  static async findByUserAndDate(userId, date) {
    const pool = require('../config/database');
    const [records] = await pool.execute(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
      [userId, date]
    );
    return records[0] || null;
  }

  static async updateCheckOut(userId, date, checkOut, workingHours) {
    const pool = require('../config/database');
    await pool.execute(
      'UPDATE attendance SET check_out = ?, working_hours = ? WHERE user_id = ? AND date = ?',
      [checkOut, workingHours, userId, date]
    );
    return true;
  }

  static async getUserAttendance(userId, month = null) {
    const pool = require('../config/database');
    let query = 'SELECT * FROM attendance WHERE user_id = ?';
    const params = [userId];

    if (month) {
      query += ' AND MONTH(date) = MONTH(?) AND YEAR(date) = YEAR(?)';
      params.push(month, month);
    }

    query += ' ORDER BY date DESC';
    const [attendance] = await pool.execute(query, params);
    return attendance;
  }

  static async getTodayAttendance(date) {
    const pool = require('../config/database');
    const [attendance] = await pool.execute(
      `SELECT a.*, u.name, u.employee_id 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.date = ? 
       ORDER BY a.check_in`,
      [date]
    );
    return attendance;
  }

  static async getMonthlyStats(userId, month, year) {
    const pool = require('../config/database');
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'Half-day' THEN 1 END) as halfDay,
        COUNT(CASE WHEN status = 'Leave' THEN 1 END) as leave
       FROM attendance 
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, month, year]
    );
    return stats[0];
  }
}

module.exports = Attendance;