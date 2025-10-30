const { pool } = require("../config/db");

const insertOtpLog = async ({
  mobile_number,
  country_code,
  otp,
  transaction_id,
}) => {
  try {
    const created_at = new Date();
    const n_attempts = 1;
    const status = "PENDING";

    const query = `
      INSERT INTO otp_log (
        log_id,
        country_code,
        created_at,
        mobile_number,
        n_attempts,
        otp,
        status,
        transaction_id
      ) VALUES (
        nextval('otp_log_seq'), $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *;
    `;

    const values = [
      country_code,
      created_at,
      mobile_number,
      n_attempts,
      otp,
      status,
      transaction_id,
    ];

    const { rows } = await pool.query(query, values);
    return { success: true, data: rows[0] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

const getOtp = async ({ transaction_id, mobile_number }) => {
  try {
    const query = `
      SELECT * FROM otp_log
      WHERE transaction_id = $1
        AND mobile_number = $2
        AND status = 'PENDING'
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const values = [transaction_id, mobile_number];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return { success: false, message: "No pending OTP found" };
    }

    return { success: true, data: rows[0] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

const markOtpVerified = async ({ transaction_id, otp, mobile_number }) => {
  try {
    const query = `
      UPDATE otp_log
      SET status = 'VERIFIED'
      WHERE transaction_id = $1
        AND mobile_number = $2
        AND otp = $3
        AND status = 'PENDING'
      RETURNING *;
    `;
    const values = [transaction_id, mobile_number, otp];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return { success: false, message: "OTP not found or already verified" };
    }

    return { success: true, data: rows[0] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

module.exports = { insertOtpLog, markOtpVerified, getOtp };
