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

module.exports = { insertOtpLog };
