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

const getReportedCommentsWithDetails = async () => {
  try {
    const query = `
      SELECT
        c.comment_id,
        c.post_id,
        c.user_id AS comment_owner_id,
        c.text,
        c.emoji,
        c.image_url,
        c.created_at AS comment_created_at,

        COUNT(cr.*) AS total_reports,

        -- All individual reports for this comment
        json_agg(
          json_build_object(
            'report_id', cr.id,               -- assuming PK in comment_reports is "id"
            'type', cr.type,
            'subtype', cr.subtype,
            'notes', cr.notes,
            'reported_by', cr.reported_by,
            'reported_at', cr.created_at
          )
          ORDER BY cr.created_at DESC
        ) AS reports

      FROM comment_reports cr
      JOIN comments c ON c.comment_id = cr.comment_id
      GROUP BY c.comment_id
      ORDER BY total_reports DESC, comment_created_at DESC;
    `;

    const { rows } = await pool.query(query);
    return { success: true, reportedComments: rows };
  } catch (err) {
    console.error("❌ Error in getReportedCommentsWithDetails:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch reported comments",
    };
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportsByCommentId,
  getReportsByUserId,
  getReportedCommentsWithDetails,
};
