const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if not exists
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
    
    // Create other tables...
    console.log('✅ Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();