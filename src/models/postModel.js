const { pool } = require("../config/db");

const allowedFields = [
  "posted_by",
  "content",
  "content_meta",
  "status",
  "visibility",
];

const createNewPosts = async (data) => {
  try {
    if (!data) {
      return { success: false, message: "No data provided" };
    }

    // filter only allowed fields
    const keys = Object.keys(data).filter((key) => allowedFields.includes(key));

    if (!keys.includes("posted_by")) {
      return { success: false, message: "posted_by is required" };
    }
    if (!keys.includes("content")) {
      return { success: false, message: "content is required" };
    }

    // map values
    const values = keys.map((key) =>
      key === "content_meta" ? JSON.stringify(data[key]) : data[key]
    );

    // build dynamic query
    const columns = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO posts (${columns})
      VALUES (${placeholders})
      RETURNING post_code, posted_by, content, content_meta, status, visibility, created_at;
    `;

    const { rows } = await pool.query(query, values);

    return { success: true, post: rows[0] };
  } catch (err) {
    console.error("❌ Error in createNewPosts:", err.message);
    return { success: false, status: 500, message: "Database insert failed" };
  }
};

const updatePostByCode = async (postCode, data) => {
  try {
    if (!postCode) {
      return { success: false, message: "post_code is required" };
    }
    if (!data || Object.keys(data).length === 0) {
      return { success: false, message: "No update data provided" };
    }

    // filter only allowed fields
    const keys = Object.keys(data).filter((key) => allowedFields.includes(key));

    if (keys.length === 0) {
      return { success: false, message: "No valid fields to update" };
    }

    // map values
    const values = keys.map((key) =>
      key === "content_meta" ? JSON.stringify(data[key]) : data[key]
    );

    // build dynamic SET clause
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

    // add post_code as last param
    values.push(postCode);

    const query = `
      UPDATE posts
      SET ${setClause}, updated_at = NOW()
      WHERE post_code = $${values.length}
      RETURNING post_code, posted_by, content, content_meta, status, visibility, created_at, updated_at;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return { success: false, message: "Post not found" };
    }

    return { success: true, post: rows[0] };
  } catch (err) {
    console.error("❌ Error in updatePostByCode:", err.message);
    return { success: false, status: 500, message: "Database update failed" };
  }
};

const deletePostByCode = async (postCode) => {
  try {
    if (!postCode) {
      return { success: false, message: "post_code is required" };
    }

    const query = `
      UPDATE posts
      SET status = 'deleted', updated_at = NOW()
      WHERE post_code = $1
      RETURNING post_code, posted_by, content, content_meta, status, visibility, created_at, updated_at;
    `;

    const { rows } = await pool.query(query, [postCode]);

    if (rows.length === 0) {
      return { success: false, message: "Post not found" };
    }

    return { success: true, post: rows[0] };
  } catch (err) {
    console.error("❌ Error in deletePostByCode:", err.message);
    return { success: false, status: 500, message: "Database delete failed" };
  }
};

module.exports = {
  createNewPosts,
  updatePostByCode,
  deletePostByCode
};
