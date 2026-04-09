const adminModel = require("../../models/adminModel");

/**
 * Controller to fetch and display dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const [stats, latestPosts] = await Promise.all([
      adminModel.getAdminStats(),
      adminModel.getLatestPostsWithStats(),
    ]);

    res.render("admin/dashboard.njk", {
      title: "Admin Dashboard",
      user: req.session.admin,
      stats: stats || {},
      latestPosts: latestPosts || [],
    });
  } catch (err) {
    console.error("❌ Error in getDashboardStats:", err.message);
    res.render("admin/dashboard.njk", {
      title: "Admin Dashboard",
      user: req.session.admin,
      stats: {},
      error: "Failed to load statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};
