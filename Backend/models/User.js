class User {
  static async findById(id) {
    const pool = require('../config/database');
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  static async findByEmail(email) {
    const pool = require('../config/database');
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  static async findByEmployeeId(employeeId) {
    const pool = require('../config/database');
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE employee_id = ?',
      [employeeId]
    );
    return users[0] || null;
  }

  static async create(userData) {
    const pool = require('../config/database');
    const { employeeId, name, email, password, role = 'employee' } = userData;

    const [result] = await pool.execute(
      `INSERT INTO users (employee_id, name, email, password, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [employeeId, name, email, password, role]
    );

    return result.insertId;
  }

  static async update(id, updateData) {
    const pool = require('../config/database');
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;

    await pool.execute(query, [...values, id]);
    return true;
  }

  static async getAll() {
    const pool = require('../config/database');
    const [users] = await pool.execute(
      'SELECT id, employee_id, name, email, role FROM users ORDER BY name'
    );
    return users;
  }
}

module.exports = User;