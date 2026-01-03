const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  try {
    // Create connection without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (let statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('Database setup completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();