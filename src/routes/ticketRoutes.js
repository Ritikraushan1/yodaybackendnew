const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  ensureAdmin,
} = require("../middlewares/authMiddleware");
const {
  createTicketHandler,
  getAllTicketsHandler,
  getTicketsByUserHandler,
  updateTicketHandler,
  addReplyHandler,
  deleteTicketHandler,
} = require("../controllers/ticketController");

// 1️⃣ Create a new ticket (any authenticated user)
router.post("/", authMiddleware, createTicketHandler);

// 2️⃣ Get all tickets (admin only)
router.get("/", ensureAdmin, getAllTicketsHandler);

// 3️⃣ Get tickets for the logged-in user
router.get("/my-tickets", authMiddleware, getTicketsByUserHandler);

// 4️⃣ Update ticket (admin or owner can extend later)
router.put("/:id", ensureAdmin, updateTicketHandler);

// 5️⃣ Add reply to ticket (admin only or extend later)
router.post("/:id/reply", ensureAdmin, addReplyHandler);

// 6️⃣ Delete ticket (soft delete, admin only)
router.delete("/:id", ensureAdmin, deleteTicketHandler);

module.exports = router;
