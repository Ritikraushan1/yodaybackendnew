const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    createUsersTable();
    console.log("✅ Connected to PostgreSQL database");
    client.release(); // release back to pool
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL:", err.message);
    process.exit(1); // stop the server if DB fails
  }
};

const createUsersTable = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        my_row_id SERIAL PRIMARY KEY,
        id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
        country_code VARCHAR(10),
        mobile_number VARCHAR(20),
        type VARCHAR(50),
        resource VARCHAR(255),
        app_version VARCHAR(50),
        push_token VARCHAR(255),
        device_os VARCHAR(50),
        os_version VARCHAR(50),
        device_model VARCHAR(100),
        device_name VARCHAR(100),
        user_agent TEXT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        modified_at TIMESTAMP DEFAULT NOW(),
        email_id VARCHAR(255),
        mbl_num_otp VARCHAR(10),
        user_type VARCHAR(255) DEFAULT 'USER',
        is_deleted BOOLEAN DEFAULT FALSE,
        allow_web SMALLINT DEFAULT 0,
        device_id VARCHAR(255) DEFAULT NULL
      );
    `);
    console.log("✅ Users table created successfully");
  } catch (err) {
    console.error("❌ Error creating users table:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
