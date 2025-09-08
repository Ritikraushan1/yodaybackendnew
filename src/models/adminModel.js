const { pool } = require("../config/db");

// Get admin by email
async function getAdminByEmail(email) {
  try {
    const query =
      "SELECT id, email, name, role, status FROM admins WHERE email=$1";
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getAdminByEmail:", err.message);
    return null;
  }
}

module.exports = { getAdminByEmail };
