class Payroll {
  static async createOrUpdate(data) {
    const pool = require('../config/database');
    const { userId, monthYear, basicSalary, allowances = 0, deductions = 0, bonus = 0 } = data;

    const netSalary = basicSalary + allowances + bonus - deductions;

    const [result] = await pool.execute(
      `INSERT INTO payroll (user_id, month_year, basic_salary, allowances, deductions, bonus, net_salary) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       basic_salary = ?, allowances = ?, deductions = ?, bonus = ?, net_salary = ?`,
      [userId, monthYear, basicSalary, allowances, deductions, bonus, netSalary,
       basicSalary, allowances, deductions, bonus, netSalary]
    );

    return result.insertId;
  }

  static async findByUser(userId, monthYear = null) {
    const pool = require('../config/database');
    let query = 'SELECT * FROM payroll WHERE user_id = ?';
    const params = [userId];

    if (monthYear) {
      query += ' AND month_year = ?';
      params.push(monthYear);
    }

    query += ' ORDER BY month_year DESC';
    const [payrolls] = await pool.execute(query, params);
    return payrolls;
  }

  static async findByMonth(monthYear) {
    const pool = require('../config/database');
    const [payrolls] = await pool.execute(
      `SELECT p.*, u.name, u.employee_id 
       FROM payroll p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.month_year = ?`,
      [monthYear]
    );
    return payrolls;
  }

  static async updateStatus(id, status) {
    const pool = require('../config/database');
    await pool.execute(
      'UPDATE payroll SET status = ? WHERE id = ?',
      [status, id]
    );
    return true;
  }

  static async findById(id) {
    const pool = require('../config/database');
    const [payrolls] = await pool.execute(
      'SELECT * FROM payroll WHERE id = ?',
      [id]
    );
    return payrolls[0] || null;
  }
}

module.exports = Payroll;