const { pool } = require("../config/db");

const allowedFields = ["title", "raised_by", "content", "status", "reply"];

// 1️⃣ Create a new ticket
const createTicket = async (data) => {
  try {
    if (!data) return { success: false, message: "No data provided" };

    const keys = Object.keys(data).filter((key) => allowedFields.includes(key));

    if (!keys.includes("raised_by"))
      return { success: false, message: "raised_by is required" };
    if (!keys.includes("title"))
      return { success: false, message: "title is required" };
    if (!keys.includes("content"))
      return { success: false, message: "content is required" };

    const values = keys.map((key) =>
      key === "reply" ? JSON.stringify(data[key]) : data[key]
    );

    const columns = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO tickets (${columns})
      VALUES (${placeholders})
      RETURNING id, title, raised_by, content, status, reply, raised_date, created_at, updated_at;
    `;

    const { rows } = await pool.query(query, values);
    return { success: true, ticket: rows[0] };
  } catch (err) {
    console.error("❌ Error in createTicket:", err.message);
    return { success: false, status: 500, message: "Database insert failed" };
  }
};

// 2️⃣ Get all tickets
const getAllTickets = async () => {
  try {
    const query = `
      SELECT id, title, raised_by, content, status, reply, raised_date, created_at, updated_at
      FROM tickets
      ORDER BY raised_date DESC;
    `;
    const { rows } = await pool.query(query);
    return { success: true, tickets: rows };
  } catch (err) {
    console.error("❌ Error in getAllTickets:", err.message);
    return { success: false, status: 500, message: "Failed to fetch tickets" };
  }
};

// 3️⃣ Get tickets by user
const getTicketsByUser = async (userId) => {
  try {
    if (!userId) return { success: false, message: "User ID is required" };

    const query = `
      SELECT id, title, raised_by, content, status, reply, raised_date, created_at, updated_at
      FROM tickets
      WHERE raised_by = $1
      ORDER BY raised_date DESC;
    `;

    const { rows } = await pool.query(query, [userId]);
    return { success: true, tickets: rows };
  } catch (err) {
    console.error("❌ Error in getTicketsByUser:", err.message);
    return { success: false, status: 500, message: "Failed to fetch tickets" };
  }
};

// 4️⃣ Update ticket
const updateTicketById = async (ticketId, data) => {
  try {
    if (!ticketId) return { success: false, message: "Ticket ID is required" };
    if (!data || Object.keys(data).length === 0)
      return { success: false, message: "No update data provided" };

    const keys = Object.keys(data).filter((key) => allowedFields.includes(key));
    if (keys.length === 0)
      return { success: false, message: "No valid fields to update" };

    const values = keys.map((key) =>
      key === "reply" ? JSON.stringify(data[key]) : data[key]
    );
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    values.push(ticketId);

    const query = `
      UPDATE tickets
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, title, raised_by, content, status, reply, raised_date, created_at, updated_at;
    `;

    const { rows } = await pool.query(query, values);
    if (rows.length === 0)
      return { success: false, message: "Ticket not found" };

    return { success: true, ticket: rows[0] };
  } catch (err) {
    console.error("❌ Error in updateTicketById:", err.message);
    return { success: false, status: 500, message: "Database update failed" };
  }
};

// 5️⃣ Add reply to ticket
const addReplyToTicket = async (ticketId, reply) => {
  try {
    if (!ticketId) return { success: false, message: "Ticket ID is required" };
    if (!reply) return { success: false, message: "Reply is required" };

    const query = `
      UPDATE tickets
      SET reply = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, raised_by, content, status, reply, raised_date, created_at, updated_at;
    `;

    const { rows } = await pool.query(query, [reply, ticketId]);
    if (rows.length === 0)
      return { success: false, message: "Ticket not found" };

    return { success: true, ticket: rows[0] };
  } catch (err) {
    console.error("❌ Error in addReplyToTicket:", err.message);
    return { success: false, status: 500, message: "Database update failed" };
  }
};

// 6️⃣ Delete ticket (soft delete by setting status)
const deleteTicketById = async (ticketId) => {
  try {
    if (!ticketId) return { success: false, message: "Ticket ID is required" };

    const query = `
      UPDATE tickets
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING id, title, raised_by, content, status, reply, raised_date, created_at, updated_at;
    `;

    const { rows } = await pool.query(query, [ticketId]);
    if (rows.length === 0)
      return { success: false, message: "Ticket not found" };

    return { success: true, ticket: rows[0] };
  } catch (err) {
    console.error("❌ Error in deleteTicketById:", err.message);
    return { success: false, status: 500, message: "Database delete failed" };
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketsByUser,
  updateTicketById,
  addReplyToTicket,
  deleteTicketById,
};
