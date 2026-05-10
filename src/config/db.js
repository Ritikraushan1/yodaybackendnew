const { Pool } = require("pg");
const fs = require("fs");
const path = require('path');
require("dotenv").config();

const caCertPath = path.join(__dirname, '..', 'certs', 'rds-ca-global.pem');
const caCert = fs.readFileSync(caCertPath).toString();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    ca: caCert,
  },
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    await createUsersTable();
    await createUserBlocksTable();
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

const createUserBlocksTable = async () => {
  try {
    // Ensure the 'id' field in 'users' has a unique constraint so it can be referenced as a foreign key.
    // If the constraint already exists, Postgres will throw an error which we catch and ignore safely.
    try {
      await pool.query(`ALTER TABLE users ADD CONSTRAINT users_id_unique UNIQUE (id);`);
      console.log("✅ Added unique constraint to users(id)");
    } catch (err) {
      // Ignore if the constraint already exists (error code 42P16 or containing 'already exists')
      if (err.code !== "42P16" && !err.message.includes("already exists")) {
        console.warn("⚠️ Warning adding unique constraint to users(id):", err.message);
      }
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id SERIAL PRIMARY KEY,
        blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
        CONSTRAINT chk_not_self_blocking CHECK (blocker_id != blocked_id)
      );
    `);
    console.log("✅ User blocks table created successfully");
  } catch (err) {
    console.error("❌ Error creating user blocks table:", err.message);
    process.exit(1);
  }
};


module.exports = { connectDB, pool };

