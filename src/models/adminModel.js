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

async function getAdminStats() {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM posts) AS total_posts,
        (SELECT COUNT(*) FROM comments) AS total_comments,
        (SELECT COUNT(*) FROM users WHERE is_deleted = FALSE) AS total_users,
        (SELECT CASE WHEN EXISTS (SELECT 1 FROM posts WHERE created_at >= CURRENT_DATE) THEN 'Yes' ELSE 'No' END) AS post_today,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours' AND is_deleted = FALSE) AS new_users_24h,
        (SELECT (SELECT COUNT(*) FROM post_likes) + (SELECT COUNT(*) FROM comment_likes)) AS total_likes
    `;
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.error("❌ Error in getAdminStats:", err.message);
    return null;
  }
}

async function getLatestPostsWithStats() {
  try {
    const query = `
      SELECT 
        p.post_code, 
        p.content, 
        p.created_at,
        (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.post_code AND pl.likes = TRUE) AS like_count,
        (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.post_code AND pl.dislikes = TRUE) AS dislike_count,
        (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.post_code) AS comment_count
      FROM posts p
      ORDER BY p.created_at DESC
      LIMIT 2;
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    console.error("❌ Error in getLatestPostsWithStats:", err.message);
    return [];
  }
}

module.exports = { getAdminByEmail, getAdminStats, getLatestPostsWithStats };
