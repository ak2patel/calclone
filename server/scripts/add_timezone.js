const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

async function migrate() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database.');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'timezone'
    `, [process.env.DB_NAME]);

    if (columns.length === 0) {
      console.log('Adding timezone column...');
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC'
      `);
      console.log('Timezone column added successfully.');
    } else {
      console.log('Timezone column already exists.');
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
