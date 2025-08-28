const { pool } = require("../config/db");

const allowedFields = [
  "id",
  "name",
  "email",
  "city",
  "state",
  "category",
  "description",
  "avatar",
  "is_email_verified",
  "u_fk",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
  "blood_group",
  "date_of_birth",
  "gender",
  "location",
  "qualification",
  "website",
  "is_willing_to_donate",
  "mobile_number",
  "alternate_mobile_number",
  "type",
];

const findUserProfileById = async (id) => {
  try {
    const query =
      "SELECT * FROM user_profiles WHERE id = $1 AND is_deleted = FALSE";
    const { rows } = await pool.query(query, [id]);

    return { success: true, user: rows[0] || null };
  } catch (err) {
    console.error("❌ Error in findUserByMobile:", err.message);
    return { success: false, status: 500, message: "Database query failed" };
  }
};

const createUserProfile = async (data) => {
  try {
    console.log("data", data);

    const keys = Object.keys(data).filter((key) => allowedFields.includes(key));

    if (!keys.includes("id")) {
      return { success: false, message: "User ID is required" };
    }

    const values = keys.map((key) => data[key] ?? null);
    const columns = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO user_profiles (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);

    return { success: true, user: rows[0] };
  } catch (err) {
    console.error("❌ Error in createUserProfile:", err.message);
    return { success: false, status: 500, message: "Database insert failed" };
  }
};

const updateUserProfileById = async (id, data) => {
  try {
    const keys = Object.keys(data).filter(
      (key) => allowedFields.includes(key) && key !== "id" // don't update the id
    );

    if (keys.length === 0) {
      return { success: false, message: "No valid fields provided to update" };
    }

    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = keys.map((key) => data[key]);

    const query = `
      UPDATE user_profiles
      SET ${setClause}, modified_at = NOW()
      WHERE id = $${keys.length + 1} AND is_deleted = FALSE
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [...values, id]);

    return { success: true, user: rows[0] || null };
  } catch (err) {
    console.error("❌ Error in updateUserProfileById:", err.message);
    return { success: false, status: 500, message: "Database update failed" };
  }
};

const deleteUserProfileById = async (id) => {
  try {
    // fetch the current profile
    const selectQuery =
      "SELECT mobile_number FROM user_profiles WHERE id = $1 AND is_deleted = FALSE";
    const { rows } = await pool.query(selectQuery, [id]);

    if (rows.length === 0) {
      return {
        success: false,
        message: "Profile not found or already deleted",
      };
    }

    const oldMobile = rows[0].mobile_number;
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // e.g. 51729
    const newMobile = `deleted-${randomNumber}-${oldMobile}`;

    // soft delete update
    const updateQuery = `
      UPDATE user_profiles
      SET is_deleted = TRUE,
          mobile_number = $1,
          modified_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const { rows: updated } = await pool.query(updateQuery, [newMobile, id]);

    return { success: true };
  } catch (err) {
    console.error("❌ Error in deleteUserProfileById:", err.message);
    return { success: false, status: 500, message: "Database delete failed" };
  }
};

module.exports = {
  findUserProfileById,
  createUserProfile,
  updateUserProfileById,
  deleteUserProfileById,
};
