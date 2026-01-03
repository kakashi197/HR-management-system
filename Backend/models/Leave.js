class Leave {
  static async create(data) {
    const pool = require('../config/database');
    const { userId, type, startDate, endDate, days, remarks } = data;

    const [result] = await pool.execute(
      `INSERT INTO leaves (user_id, type, start_date, end_date, days, remarks) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, startDate, endDate, days, remarks]
    );

    return result.insertId;
  }

  static async findByUser(userId, status = null) {
    const pool = require('../config/database');
    let query = 'SELECT * FROM leaves WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const [leaves] = await pool.execute(query, params);
    return leaves;
  }

  static async getAll(status = null) {
    const pool = require('../config/database');
    let query = `
      SELECT l.*, u.name, u.employee_id 
      FROM leaves l 
      JOIN users u ON l.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.created_at DESC';
    const [leaves] = await pool.execute(query, params);
    return leaves;
  }

  static async updateStatus(id, status, approvedBy) {
    const pool = require('../config/database');
    await pool.execute(
      'UPDATE leaves SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      [status, approvedBy, id]
    );
    return true;
  }

  static async getLeaveBalance(userId, year) {
    const pool = require('../config/database');
    const [result] = await pool.execute(
      `SELECT type, SUM(days) as used 
       FROM leaves 
       WHERE user_id = ? AND status = 'Approved' AND YEAR(start_date) = ?
       GROUP BY type`,
      [userId, year]
    );

    const balance = {
      Paid: 15,
      Sick: 10,
      Unpaid: 0
    };

    result.forEach(row => {
      balance[row.type] -= row.used;
      if (balance[row.type] < 0) balance[row.type] = 0;
    });

    return balance;
  }
}

module.exports = Leave;