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

const findUserByFacebookId = async (facebook_id) => {
  try {
    const query =
      "SELECT * FROM users WHERE facebook_id = $1 AND is_deleted = FALSE";
    const { rows } = await pool.query(query, [facebook_id]);
    return { success: true, user: rows[0] || null };
  } catch (err) {
    console.error("❌ Error in findUserByFacebookId:", err.message);
    return { success: false, status: 500, message: "Database query failed" };
  }
};

const registerFacebookUser = async (userData) => {
  try {
    const query = `
      INSERT INTO users (
        facebook_id,
        facebook_token,
        email_id,
        login_method,
        app_version,
        push_token,
        device_os,
        os_version,
        device_model,
        device_name,
        user_agent,
        status,
        user_type,
        allow_web,
        device_id
      ) VALUES (
        $1,$2,$3,'facebook',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      ) RETURNING *;
    `;
    const values = [
      userData.facebook_id,
      userData.facebook_token,
      userData.email_id || null,
      userData.app_version || null,
      userData.push_token || null,
      userData.device_os || null,
      userData.os_version || null,
      userData.device_model || null,
      userData.device_name || null,
      userData.user_agent || null,
      userData.status || "ACTIVE",
      userData.user_type || "USER",
      userData.allow_web || 0,
      userData.device_id || null,
    ];

    const { rows } = await pool.query(query, values);
    return { success: true, user: rows[0] };
  } catch (err) {
    console.error("❌ Error in registerFacebookUser:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to register Facebook user",
    };
  }
};

// Update Facebook user (mainly token + device info)
const updateFacebookUser = async (facebook_id, updateData) => {
  try {
    const query = `
      UPDATE users SET
        facebook_token = $1,
        device_os = $2,
        os_version = $3,
        device_model = $4,
        device_name = $5,
        user_agent = $6,
        app_version = $7,
        push_token = $8,
        modified_at = NOW()
      WHERE facebook_id = $9
      RETURNING *;
    `;
    const values = [
      updateData.facebook_token,
      updateData.device_os || null,
      updateData.os_version || null,
      updateData.device_model || null,
      updateData.device_name || null,
      updateData.user_agent || null,
      updateData.app_version || null,
      updateData.push_token || null,
      facebook_id,
    ];

    const { rows } = await pool.query(query, values);
    return { success: true, user: rows[0] || null };
  } catch (err) {
    console.error("❌ Error in updateFacebookUser:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to update Facebook user",
    };
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

const updateUser = async (id, updateData) => {
  try {
    const query = `
      UPDATE users SET
        app_version = $1,
        push_token = $2,
        device_os = $3,
        os_version = $4,
        device_model = $5,
        device_name = $6,
        user_agent = $7,
        device_id = $8,
        modified_at = NOW()
      WHERE id = $9 AND is_deleted = FALSE
      RETURNING *;
    `;

    const values = [
      updateData.app_version || null,
      updateData.push_token || null,
      updateData.device_os || null,
      updateData.os_version || null,
      updateData.device_model || null,
      updateData.device_name || null,
      updateData.user_agent || null,
      updateData.device_id || null,
      id,
    ];

    const { rows } = await pool.query(query, values);

    return { success: true, user: rows[0] || null };
  } catch (err) {
    console.error("❌ Error in updateUser:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to update user info",
    };
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

    // Handle NULL mobile numbers safely
    const newMobile = oldMobile ? `deleted-${oldMobile}` : `deleted-user-${id}`; // fallback

    // soft delete update
    const updateQuery = `
      UPDATE users
      SET is_deleted = TRUE,
          mobile_number = $1,
          modified_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    await pool.query(updateQuery, [newMobile, id]);

    return { success: true };
  } catch (err) {
    console.error("❌ Error in deleteUserById:", err.message);
    return { success: false, status: 500, message: "Database delete failed" };
  }
};

// Fetch all active users (not deleted)
const getAllActiveUsers = async () => {
  try {
    const query = `
      SELECT *
      FROM users
      WHERE is_deleted = FALSE
      ORDER BY id DESC;
    `;

    const { rows } = await pool.query(query);
    return { success: true, users: rows };
  } catch (err) {
    console.error("❌ Error in getAllActiveUsers:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch active users",
    };
  }
};

// Fetch only id + push_token for active users
const getAllActiveUsersPushTokens = async () => {
  try {
    const query = `
      SELECT id, push_token
      FROM users
      WHERE is_deleted = FALSE
        AND push_token IS NOT NULL
        AND push_token != ''
      ORDER BY id DESC;
    `;

    const { rows } = await pool.query(query);
    return { success: true, users: rows };
  } catch (err) {
    console.error("❌ Error in getAllActiveUsersPushTokens:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch push tokens",
    };
  }
};

module.exports = {
  findUserByMobile,
  registerNewUser,
  findUserById,
  deleteUserById,
  registerFacebookUser,
  updateFacebookUser,
  findUserByFacebookId,
  updateUser,
  getAllActiveUsers,
  getAllActiveUsersPushTokens,
};
