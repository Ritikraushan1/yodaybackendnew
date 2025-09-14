// commentReportsController.js
const {
  createReport,
  getAllReports,
  getReportsByCommentId,
  getReportsByUserId,
} = require("../models/CommentReportsModel");

/**
 * Create a report for a comment
 * POST /comments/:commentId/report
 */
const createReportHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId; // assuming auth middleware sets req.user
    const { type, subtype, notes } = req.body;

    if (!commentId || !type) {
      return res
        .status(400)
        .json({ message: "commentId and type are required" });
    }

    const result = await createReport({
      comment_id: commentId,
      reported_by: userId,
      type,
      subtype,
      notes,
    });

    if (result.success) {
      return res.status(201).json({ report: result.report });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in createReportHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

/**
 * Get all reports (admin usage)
 * GET /reports
 */
const getAllReportsHandler = async (req, res) => {
  try {
    const result = await getAllReports();
    if (result.success) {
      return res.status(200).json({ reports: result.reports });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in getAllReportsHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

/**
 * Get reports for a specific comment
 * GET /comments/:commentId/reports
 */
const getReportsByCommentHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      return res.status(400).json({ message: "commentId is required" });
    }

    const result = await getReportsByCommentId(commentId);
    if (result.success) {
      return res.status(200).json({ reports: result.reports });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in getReportsByCommentHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

/**
 * Get reports submitted by a specific user
 * GET /users/:userId/reports
 */
const getReportsByUserHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const result = await getReportsByUserId(userId);
    if (result.success) {
      return res.status(200).json({ reports: result.reports });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in getReportsByUserHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

module.exports = {
  createReportHandler,
  getAllReportsHandler,
  getReportsByCommentHandler,
  getReportsByUserHandler,
};
