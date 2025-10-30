const { pool } = require("../config/db");

// Insert a new report
const createReport = async (reportData) => {
  try {
    const query = `
      INSERT INTO comment_reports (
        comment_id,
        reported_by,
        type,
        subtype,
        notes
      ) VALUES (
        $1,$2,$3,$4,$5
      ) RETURNING *;
    `;
    const values = [
      reportData.comment_id,
      reportData.reported_by,
      reportData.type,
      reportData.subtype || null,
      reportData.notes || null,
    ];

    const { rows } = await pool.query(query, values);
    return { success: true, report: rows[0] };
  } catch (err) {
    console.error("❌ Error in createReport:", err.message);
    return { success: false, status: 500, message: "Failed to create report" };
  }
};

// Get all reports
const getAllReports = async () => {
  try {
    const query = `
      SELECT * FROM comment_reports
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return { success: true, reports: rows };
  } catch (err) {
    console.error("❌ Error in getAllReports:", err.message);
    return { success: false, status: 500, message: "Failed to fetch reports" };
  }
};

// Get all reports by a specific comment_id
const getReportsByCommentId = async (commentId) => {
  try {
    const query = `
      SELECT * FROM comment_reports
      WHERE comment_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [commentId]);
    return { success: true, reports: rows };
  } catch (err) {
    console.error("❌ Error in getReportsByCommentId:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch reports for comment",
    };
  }
};

// Get all reports by a specific user_id
const getReportsByUserId = async (userId) => {
  try {
    const query = `
      SELECT * FROM comment_reports
      WHERE reported_by = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return { success: true, reports: rows };
  } catch (err) {
    console.error("❌ Error in getReportsByUserId:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch reports for user",
    };
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportsByCommentId,
  getReportsByUserId,
};
