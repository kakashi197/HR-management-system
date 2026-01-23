const pool = require('../config/database');

// Get all employees (admin only)
const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    
    let query = `
      SELECT 
        id, employee_id, name, email, role, phone, address,
        emergency_contact, department, position, join_date,
        date_of_birth, gender, marital_status, blood_group,
        bank_account, pan_number, aadhar_number, passport_number,
        is_active, created_at
      FROM users 
      WHERE role = 'employee'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR employee_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (department) {
      query += ` AND department = ?`;
      params.push(department);
    }
    
    if (status === 'active') {
      query += ` AND is_active = TRUE`;
    } else if (status === 'inactive') {
      query += ` AND is_active = FALSE`;
    }
    
    query += ` ORDER BY name`;
    
    const [employees] = await pool.execute(query, params);
    
    // Get statistics
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive,
        COUNT(DISTINCT department) as departments
      FROM users 
      WHERE role = 'employee'
    `);
    
    res.json({
      success: true,
      employees,
      stats
    });
    
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get employee details
const getEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.execute(
      `SELECT 
        id, employee_id, name, email, role, phone, address,
        emergency_contact, department, position, join_date,
        date_of_birth, gender, marital_status, blood_group,
        bank_account, pan_number, aadhar_number, passport_number,
        skills, is_active, created_at, updated_at
       FROM users 
       WHERE id = ? AND role = 'employee'`,
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Get employee documents
    const [documents] = await pool.execute(
      'SELECT * FROM documents WHERE user_id = ?',
      [id]
    );
    
    // Get employee attendance summary
    const [[attendance]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'Half-day' THEN 1 END) as half_days,
        COUNT(CASE WHEN status = 'Leave' THEN 1 END) as leave_days,
        AVG(working_hours) as avg_working_hours
      FROM attendance 
      WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
    `, [id]);
    
    // Get leave summary
    const [[leaves]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_leaves,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_leaves,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_leaves,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_leaves
      FROM leaves 
      WHERE user_id = ? AND YEAR(start_date) = YEAR(CURDATE())
    `, [id]);
    
    res.json({
      success: true,
      employee: users[0],
      documents,
      summary: {
        attendance: attendance || {},
        leaves: leaves || {}
      }
    });
    
  } catch (error) {
    console.error('Get employee details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update employee details (admin only)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      department, position, phone, address, emergencyContact,
      dateOfBirth, gender, maritalStatus, bloodGroup,
      bankAccount, panNumber, aadharNumber, passportNumber,
      skills, isActive
    } = req.body;
    
    await pool.execute(
      `UPDATE users SET 
        department = ?, position = ?, phone = ?, address = ?, 
        emergency_contact = ?, date_of_birth = ?, gender = ?,
        marital_status = ?, blood_group = ?, bank_account = ?,
        pan_number = ?, aadhar_number = ?, passport_number = ?,
        skills = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        department, position, phone, address, emergencyContact,
        dateOfBirth, gender, maritalStatus, bloodGroup,
        bankAccount, panNumber, aadharNumber, passportNumber,
        skills, isActive, id
      ]
    );
    
    res.json({
      success: true,
      message: 'Employee updated successfully'
    });
    
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add document to employee
const addDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, fileName, filePath } = req.body;
    
    await pool.execute(
      'INSERT INTO documents (user_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
      [id, documentType, fileName, filePath]
    );
    
    res.status(201).json({
      success: true,
      message: 'Document added successfully'
    });
    
  } catch (error) {
    console.error('Add document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete employee (soft delete)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Employee deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get employee statistics
const getEmployeeStats = async (req, res) => {
  try {
    const [departments] = await pool.execute(`
      SELECT department, COUNT(*) as count 
      FROM users 
      WHERE role = 'employee' AND is_active = TRUE 
      GROUP BY department
      ORDER BY count DESC
    `);
    
    const [[genderStats]] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male,
        COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female,
        COUNT(CASE WHEN gender = 'Other' OR gender IS NULL THEN 1 END) as other
      FROM users WHERE role = 'employee'
    `);
    
    const [[hiringTrend]] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as hires
      FROM users 
      WHERE role = 'employee' 
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);
    
    res.json({
      success: true,
      departments,
      genderStats,
      hiringTrend
    });
    
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeDetails,
  updateEmployee,
  addDocument,
  deleteEmployee,
  getEmployeeStats
};