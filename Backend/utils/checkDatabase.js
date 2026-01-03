const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dayflow_hrms'
    });
    
    console.log('🔍 Checking database setup...\n');
    
    // Check tables
    const [tables] = await connection.execute(
      "SHOW TABLES"
    );
    
    console.log('📊 Tables found:', tables.length);
    tables.forEach(table => {
      console.log(`   - ${table.Tables_in_dayflow_hrms}`);
    });
    
    console.log('\n📈 Checking data...');
    
    // Check users
    const [users] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );
    console.log(`👥 Users: ${users[0].count}`);
    
    // Check attendance
    const [attendance] = await connection.execute(
      "SELECT COUNT(*) as count FROM attendance"
    );
    console.log(`📅 Attendance records: ${attendance[0].count}`);
    
    // Check leaves
    const [leaves] = await connection.execute(
      "SELECT COUNT(*) as count FROM leaves"
    );
    console.log(`🏖️  Leave records: ${leaves[0].count}`);
    
    // Check payroll
    const [payroll] = await connection.execute(
      "SELECT COUNT(*) as count FROM payroll"
    );
    console.log(`💰 Payroll records: ${payroll[0].count}`);
    
    console.log('\n✅ Database check completed!');
    
    // Show sample users
    const [sampleUsers] = await connection.execute(
      "SELECT employee_id, name, email, role FROM users LIMIT 5"
    );
    
    console.log('\n👤 Sample Users:');
    sampleUsers.forEach(user => {
      console.log(`   ${user.employee_id} - ${user.name} (${user.role}) - ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Start XAMPP MySQL');
    console.log('2. Create database: dayflow_hrms');
    console.log('3. Run: node utils/initDatabase.js');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();