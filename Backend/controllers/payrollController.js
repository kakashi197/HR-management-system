const pool = require('../config/database');

const getMyPayroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let query = 'SELECT * FROM payroll WHERE user_id = ?';
    let params = [userId];

    if (month) {
      query += ' AND month_year = ?';
      params.push(month);
    }

    query += ' ORDER BY month_year DESC';

    const [payrolls] = await pool.execute(query, params);

    res.json({
      success: true,
      payrolls
    });

  } catch (error) {
    console.error('Get my payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getPayrollSlip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [payrolls] = await pool.execute(
      'SELECT * FROM payroll WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payroll slip not found'
      });
    }

    res.json({
      success: true,
      payroll: payrolls[0]
    });

  } catch (error) {
    console.error('Get payroll slip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAllPayroll = async (req, res) => {
  try {
    const { month } = req.query;
    const monthYear = month || new Date().toISOString().slice(0, 7);

    const [payrolls] = await pool.execute(
      `SELECT p.*, u.name, u.employee_id 
       FROM payroll p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.month_year = ?`,
      [monthYear]
    );

    res.json({
      success: true,
      payrolls
    });

  } catch (error) {
    console.error('Get all payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const createPayroll = async (req, res) => {
  try {
    const { userId, monthYear, basicSalary, allowances = 0, deductions = 0, bonus = 0 } = req.body;

    const netSalary = basicSalary + allowances + bonus - deductions;

    await pool.execute(
      `INSERT INTO payroll (user_id, month_year, basic_salary, allowances, deductions, bonus, net_salary) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       basic_salary = ?, allowances = ?, deductions = ?, bonus = ?, net_salary = ?`,
      [userId, monthYear, basicSalary, allowances, deductions, bonus, netSalary,
       basicSalary, allowances, deductions, bonus, netSalary]
    );

    res.status(201).json({
      success: true,
      message: 'Payroll created/updated'
    });

  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE payroll SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Payroll status updated'
    });

  } catch (error) {
    console.error('Update payroll status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMyPayroll,
  getPayrollSlip,
  getAllPayroll,
  createPayroll,
  updatePayrollStatus
};