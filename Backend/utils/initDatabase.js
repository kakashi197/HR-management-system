const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'dayflow_hrms'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'dayflow_hrms'}' created/verified`);
    
    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'dayflow_hrms'}`);
    
    // Create users table
    await connection.execute(`
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
    console.log('✅ Users table created');
    
    // Create attendance table
    await connection.execute(`
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
    console.log('✅ Attendance table created');
    
    // Create leaves table
    await connection.execute(`
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
    console.log('✅ Leaves table created');
    
    // Create payroll table
    await connection.execute(`
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
    console.log('✅ Payroll table created');
    
    // Create admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(
      `INSERT INTO users (employee_id, name, email, password, role) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role)`,
      ['ADMIN001', 'System Admin', 'admin@dayflow.com', hashedPassword, 'admin']
    );
    console.log('✅ Admin user created/updated');
    
    // Create sample employee (password: emp123)
    const empPassword = await bcrypt.hash('emp123', 10);
    await connection.execute(
      `INSERT INTO users (employee_id, name, email, password, role, department, position) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), email = VALUES(email), department = VALUES(department)`,
      ['EMP001', 'John Doe', 'john@dayflow.com', empPassword, 'employee', 'Engineering', 'Software Engineer']
    );
    console.log('✅ Sample employee created/updated');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🔐 Default Credentials:');
    console.log('   👑 Admin: admin@dayflow.com / admin123');
    console.log('   👤 Employee: john@dayflow.com / emp123');
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();