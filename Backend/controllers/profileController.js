const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.execute(
      `SELECT id, employee_id, name, email, role, phone, address, 
              emergency_contact, department, position, join_date
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: users[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, address, emergencyContact } = req.body;

    await pool.execute(
      `UPDATE users SET phone = ?, address = ?, emergency_contact = ? 
       WHERE id = ?`,
      [phone, address, emergencyContact, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, employee_id, name, email, role, phone, department, position 
       FROM users ORDER BY name`
    );

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, position, phone, address } = req.body;

    await pool.execute(
      `UPDATE users SET department = ?, position = ?, phone = ?, address = ? 
       WHERE id = ?`,
      [department, position, phone, address, id]
    );

    res.json({
      success: true,
      message: 'Employee profile updated'
    });

  } catch (error) {
    console.error('Update employee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllProfiles,
  updateEmployeeProfile
};