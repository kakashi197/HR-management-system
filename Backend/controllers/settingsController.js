const pool = require('../config/database');

// Get all settings
const getSettings = async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM settings ORDER BY setting_key'
    );

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update setting
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    await pool.execute(
      `INSERT INTO settings (setting_key, setting_value) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, value, value]
    );

    res.json({
      success: true,
      message: 'Setting updated successfully'
    });

  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get company settings
const getCompanySettings = async (req, res) => {
  try {
    const [settings] = await pool.execute(
      `SELECT * FROM settings 
       WHERE setting_key IN ('company_name', 'company_address', 'company_email', 
                           'company_phone', 'company_logo', 'leave_policy',
                           'attendance_policy', 'working_hours', 'payroll_date')`
    );

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    res.json({
      success: true,
      settings: settingsObj
    });

  } catch (error) {
    console.error('Get company settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getSettings,
  updateSetting,
  getCompanySettings
};