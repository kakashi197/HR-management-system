const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with mysql2/promise
const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dayflow_hrms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    // Create tables if not exists
    await createTables();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('📌 Please check:');
    console.log('1. XAMPP MySQL is running');
    console.log('2. Database name: dayflow_hrms');
    console.log('3. Username: root');
    console.log('4. Password: (empty)');
  }
})();

// Create tables function
async function createTables() {
  try {
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'admin') DEFAULT 'employee',
        phone VARCHAR(20),
        address TEXT,
        emergency_contact VARCHAR(100),
        department VARCHAR(100),
        position VARCHAR(100),
        join_date DATE DEFAULT CURDATE(),
        profile_picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    // Create admin user if not exists
    const [adminUsers] = await pool.execute(
      "SELECT * FROM users WHERE email = 'admin@dayflow.com'"
    );
    
    if (adminUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.execute(
        `INSERT INTO users (employee_id, name, email, password, role) 
         VALUES (?, ?, ?, ?, ?)`,
        ['ADMIN001', 'System Admin', 'admin@dayflow.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created');
    }

    // Create attendance table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status ENUM('Present', 'Absent', 'Half-day', 'Leave') DEFAULT 'Absent',
        working_hours DECIMAL(5,2),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);
    console.log('✅ Attendance table created/verified');

    // Create leaves table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type ENUM('Paid', 'Sick', 'Unpaid') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days INT NOT NULL,
        remarks TEXT,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Leaves table created/verified');

    // Create payroll table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payroll (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        month_year VARCHAR(7) NOT NULL,
        basic_salary DECIMAL(10,2) DEFAULT 0,
        allowances DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        bonus DECIMAL(10,2) DEFAULT 0,
        net_salary DECIMAL(10,2) DEFAULT 0,
        status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending',
        payment_date DATE,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_month (user_id, month_year)
      )
    `);
    console.log('✅ Payroll table created/verified');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

// ============ AUTH MIDDLEWARE ============
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dayflow-secret-key');
      
      // Get user from database
      const [users] = await pool.execute(
        'SELECT id, employee_id, name, email, role FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      req.user = users[0];
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body);
    
    const { employeeId, name, email, password, role = 'employee' } = req.body;
    
    // Validation
    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR employee_id = ?',
      [email, employeeId]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user into database
    const [result] = await pool.execute(
      `INSERT INTO users (employee_id, name, email, password, role, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [employeeId, name, email, hashedPassword, role]
    );
    
    console.log('✅ User inserted with ID:', result.insertId);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET || 'dayflow-secret-key',
      { expiresIn: '7d' }
    );
    
    // Get the created user
    const [newUsers] = await pool.execute(
      'SELECT id, employee_id, name, email, role FROM users WHERE id = ?',
      [result.insertId]
    );
    
    const user = newUsers[0];
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
    console.log('✅ Registration successful for:', email);
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔑 Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'dayflow-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful for:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ============ PROFILE ROUTES ============
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, employee_id, name, email, role, phone, address, 
              emergency_contact, department, position, join_date
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    res.json({
      success: true,
      name: user.name,
      employeeId: user.employee_id,
      email: user.email,
      role: user.role,
      department: user.department || 'Not assigned',
      position: user.position || 'Not assigned',
      phone: user.phone || 'Not provided',
      address: user.address || 'Not provided',
      joinDate: user.join_date ? user.join_date.toISOString().split('T')[0] : 'Not available',
      emergencyContact: user.emergency_contact || 'Not provided'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { address, phone, emergencyContact } = req.body;
    const userId = req.user.id;
    
    await pool.execute(
      `UPDATE users SET phone = ?, address = ?, emergency_contact = ?, 
       updated_at = NOW() WHERE id = ?`,
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
});

// ============ ATTENDANCE ROUTES ============
app.post('/api/attendance/checkin', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    // Check if already checked in today
    const [existing] = await pool.execute(
      `SELECT * FROM attendance WHERE user_id = ? AND date = ?`,
      [userId, today]
    );
    
    if (existing.length > 0 && existing[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }
    
    if (existing.length > 0) {
      // Update existing record
      await pool.execute(
        `UPDATE attendance SET check_in = ?, status = 'Present' 
         WHERE user_id = ? AND date = ?`,
        [timeString, userId, today]
      );
    } else {
      // Create new record
      await pool.execute(
        `INSERT INTO attendance (user_id, date, check_in, status, created_at) 
         VALUES (?, ?, ?, 'Present', NOW())`,
        [userId, today, timeString]
      );
    }
    
    res.json({
      success: true,
      message: 'Checked in successfully',
      time: timeString.substring(0, 5)
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/attendance/checkout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    // Get check-in time
    const [attendance] = await pool.execute(
      `SELECT check_in FROM attendance WHERE user_id = ? AND date = ?`,
      [userId, today]
    );
    
    if (attendance.length === 0 || !attendance[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Not checked in today'
      });
    }
    
    const checkInTime = new Date(`${today}T${attendance[0].check_in}`);
    const diffMs = now - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Update check-out time and calculate working hours
    await pool.execute(
      `UPDATE attendance SET check_out = ?, working_hours = ROUND(?, 2) 
       WHERE user_id = ? AND date = ?`,
      [timeString, diffHours, userId, today]
    );
    
    res.json({
      success: true,
      message: 'Checked out successfully',
      workingHours: diffHours.toFixed(2)
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ LEAVE ROUTES ============
app.post('/api/leave', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate, remarks } = req.body;
    
    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Type, start date and end date are required'
      });
    }
    
    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Create leave request
    const [result] = await pool.execute(
      `INSERT INTO leaves (user_id, type, start_date, end_date, days, remarks, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, type, startDate, endDate, days, remarks]
    );
    
    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leaveId: result.insertId
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ DASHBOARD ROUTES ============
app.get('/api/dashboard/employee', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Get attendance count for current month
    const [attendanceResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM attendance 
       WHERE user_id = ? AND status = 'Present' 
       AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, currentMonth, currentYear]
    );
    
    // Get pending leave requests
    const [leaveResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM leaves 
       WHERE user_id = ? AND status = 'Pending'`,
      [userId]
    );
    
    // Get upcoming leaves
    const [upcomingResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM leaves 
       WHERE user_id = ? AND status = 'Approved' 
       AND start_date >= ?`,
      [userId, today]
    );
    
    res.json({
      success: true,
      stats: {
        attendance: attendanceResult[0].count || 0,
        leaveRequests: leaveResult[0].count || 0,
        upcomingLeaves: upcomingResult[0].count || 0
      },
      recentActivity: [
        {
          title: 'Welcome to Dayflow HRMS',
          description: 'Your HR management system',
          date: new Date().toLocaleDateString()
        }
      ]
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/dashboard/admin', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get total employees
    const [empResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'employee'"
    );
    
    // Get pending leaves
    const [leaveResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM leaves WHERE status = 'Pending'"
    );
    
    // Get today's attendance
    const [attendanceResult] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as count FROM attendance 
       WHERE date = ? AND status = 'Present'`,
      [today]
    );
    
    // Get recent pending leaves
    const [recentLeaves] = await pool.execute(
      `SELECT l.*, u.name as employeeName, u.employee_id as employeeId
       FROM leaves l
       JOIN users u ON l.user_id = u.id
       WHERE l.status = 'Pending'
       ORDER BY l.created_at DESC LIMIT 5`
    );
    
    res.json({
      success: true,
      stats: {
        totalEmployees: empResult[0].count || 0,
        pendingLeaves: leaveResult[0].count || 0,
        todaysAttendance: attendanceResult[0].count || 0,
        payrollProcessed: 0
      },
      recentLeaves: recentLeaves.map(leave => ({
        id: leave.id,
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        type: leave.type,
        startDate: leave.start_date,
        endDate: leave.end_date,
        status: leave.status
      }))
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ TEST ROUTES ============
app.get('/api/test/users', async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users');
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }))
    });
  } catch (error) {
    console.error('Test users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'HRMS API is running',
    timestamp: new Date().toISOString(),
    database: 'MySQL'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT 1 + 1 AS solution');
    res.json({
      success: true,
      message: 'Database connection successful',
      result: result[0].solution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      details: 'Check if MySQL is running and database exists'
    });
  }
});

// ============ ERROR HANDLING ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 HRMS Backend Started`);
  console.log(`========================================`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend URL: http://localhost:5173`);
  console.log(`📊 Test users: http://localhost:${PORT}/api/test/users`);
  console.log(`\n🔐 Test Credentials:`);
  console.log(`   👑 Admin: admin@dayflow.com / admin123`);
  console.log(`   👤 Employee (register new ones)`);
  console.log(`\n📌 Database Info:`);
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'dayflow_hrms'}`);
  console.log(`========================================\n`);
});