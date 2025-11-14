const { pool } = require("../config/db");

/**
 * Save a new OTP for an admin
 * @param {number} adminId
 * @param {string} otpCode
 * @param {Date} expiresAt
 */
async function saveAdminOtp(adminId, otpCode, expiresAt) {
  try {
    const query = `
      INSERT INTO admin_otps (admin_id, otp_code, otp_expires_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [adminId, otpCode, expiresAt];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    console.error("❌ Error saving admin OTP:", err.message);
    return null;
  }
}

/**
 * Get the latest OTP for an admin
 * @param {number} adminId
 */
async function getLatestAdminOtp(adminId) {
  try {
    const query = `
      SELECT *
      FROM admin_otps
      WHERE admin_id = $1
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [adminId]);
    return rows[0] || null;
  } catch (err) {
    console.error("❌ Error fetching latest admin OTP:", err.message);
    return null;
  }
}

module.exports = {
  saveAdminOtp,
  getLatestAdminOtp,
};
