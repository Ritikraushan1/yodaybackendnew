const {
  createTicket,
  getAllTickets,
  getTicketsByUser,
  updateTicketById,
  addReplyToTicket,
  deleteTicketById,
} = require("../models/ticketModel");

// 1️⃣ Create a new ticket
const createTicketHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    if (!data || !data.title || !data.content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const newTicket = await createTicket({
      ...data,
      raised_by: userId,
      status: "pending",
    });

    if (!newTicket.success) {
      return res.status(500).json({ message: newTicket.message });
    }

    return res.status(201).json({ ticket: newTicket.ticket });
  } catch (error) {
    console.error("❌ Error in createTicketHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// 2️⃣ Get all tickets
const getAllTicketsHandler = async (req, res) => {
  try {
    const ticketsData = await getAllTickets();
    if (!ticketsData.success) {
      return res.status(500).json({ message: ticketsData.message });
    }

    return res.status(200).json({ tickets: ticketsData.tickets });
  } catch (error) {
    console.error("❌ Error in getAllTicketsHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// 3️⃣ Get tickets by user
const getTicketsByUserHandler = async (req, res) => {
  try {
    const userId = req.user.userId;

    const ticketsData = await getTicketsByUser(userId);
    if (!ticketsData.success) {
      return res.status(500).json({ message: ticketsData.message });
    }

    return res.status(200).json({ tickets: ticketsData.tickets });
  } catch (error) {
    console.error("❌ Error in getTicketsByUserHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// 4️⃣ Update a ticket
const updateTicketHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) return res.status(400).json({ message: "Ticket ID is required" });
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updatedTicket = await updateTicketById(id, data);

    if (!updatedTicket.success) {
      return res.status(404).json({ message: updatedTicket.message });
    }

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket.ticket,
    });
  } catch (error) {
    console.error("❌ Error in updateTicketHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// 5️⃣ Add reply to ticket
const addReplyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!id) return res.status(400).json({ message: "Ticket ID is required" });
    if (!reply) return res.status(400).json({ message: "Reply is required" });

    const updatedTicket = await addReplyToTicket(id, reply);

    if (!updatedTicket.success) {
      return res.status(404).json({ message: updatedTicket.message });
    }

    return res.status(200).json({
      message: "Reply added successfully",
      ticket: updatedTicket.ticket,
    });
  } catch (error) {
    console.error("❌ Error in addReplyHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// 6️⃣ Delete ticket (soft delete)
const deleteTicketHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Ticket ID is required" });

    const deletedTicket = await deleteTicketById(id);

    if (!deletedTicket.success) {
      return res.status(404).json({ message: deletedTicket.message });
    }

    return res.status(200).json({
      message: "Ticket deleted successfully",
      ticket: deletedTicket.ticket,
    });
  } catch (error) {
    console.error("❌ Error in deleteTicketHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

module.exports = {
  createTicketHandler,
  getAllTicketsHandler,
  getTicketsByUserHandler,
  updateTicketHandler,
  addReplyHandler,
  deleteTicketHandler,
};
