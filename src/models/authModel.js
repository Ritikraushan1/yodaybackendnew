const { pool } = require("../config/db");

const findUserByMobile = async (mobile_number) => {
  try {
    const query =
      "SELECT * FROM users WHERE mobile_number = $1 AND is_deleted = FALSE";
    const { rows } = await pool.query(query, [mobile_number]);
    return { success: true, user: rows[0] || null };
  } catch (err) {
    console.error("❌ Error in findUserByMobile:", err.message);
    return { success: false, status: 500, message: "Database query failed" };
  }
};

const findUserById = async (id) => {
  try {
    const query = "SELECT * FROM users WHERE id = $1 AND is_deleted = FALSE";
    const { rows } = await pool.query(query, [id]);
    return { success: true, user: rows[0] || null };
  } catch (err) {
    console.error("❌ Error in findUserByMobile:", err.message);
    return { success: false, status: 500, message: "Database query failed" };
  }
};

const registerNewUser = async (userData) => {
  try {
    const query = `
        INSERT INTO users (
          mobile_number,
          country_code,
          type,
          resource,
          app_version,
          push_token,
          device_os,
          os_version,
          device_model,
          device_name,
          user_agent,
          status,
          email_id,
          mbl_num_otp,
          user_type,
          allow_web,
          device_id
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
        ) RETURNING *;
      `;
    const values = [
      userData.mobile_number,
      userData.country_code || null,
      userData.type || null,
      userData.resource || null,
      userData.app_version || null,
      userData.push_token || null,
      userData.device_os || null,
      userData.os_version || null,
      userData.device_model || null,
      userData.device_name || null,
      userData.user_agent || null,
      userData.status || null,
      userData.email_id || null,
      userData.mbl_num_otp || null,
      userData.user_type || "USER",
      userData.allow_web || 0,
      userData.device_id || null,
    ];

    const { rows } = await pool.query(query, values);
    return { success: true, user: rows[0] };
  } catch (err) {
    console.error("❌ Error in UserModel.create:", err.message);
    return { success: false, status: 500, message: "Failed to register user" };
  }
};

const deleteUserById = async (id) => {
  try {
    // fetch the current user
    const selectQuery =
      "SELECT mobile_number FROM users WHERE id = $1 AND is_deleted = FALSE";
    const { rows } = await pool.query(selectQuery, [id]);

    if (rows.length === 0) {
      return { success: false, message: "User not found or already deleted" };
    }

    const oldMobile = rows[0].mobile_number;
    const randomNumber = Math.floor(10 + Math.random() * 90); // e.g., 51729
    const newMobile = `deleted-${oldMobile}`;

    // soft delete update
    const updateQuery = `
      UPDATE users
      SET is_deleted = TRUE,
          mobile_number = $1,
          modified_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const { rows: updated } = await pool.query(updateQuery, [newMobile, id]);

    return { success: true };
  } catch (err) {
    console.error("❌ Error in deleteUserById:", err.message);
    return { success: false, status: 500, message: "Database delete failed" };
  }
};

module.exports = {
  findUserByMobile,
  registerNewUser,
  findUserById,
  deleteUserById,
};
