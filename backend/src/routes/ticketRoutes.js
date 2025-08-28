import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { 
  generateTicket, 
  getUserTickets, 
  downloadTicket, 
  validateTicket, 
  useTicket 
} from "../controllers/ticketController.js";

const router = Router();

// Generate ticket after payment confirmation
router.post("/generate", authRequired, generateTicket);

// Get user's tickets
router.get("/my-tickets", authRequired, getUserTickets);

// Download ticket
router.get("/:id/download", authRequired, downloadTicket);

// Validate ticket (for event organizers)
router.post("/validate", authRequired, validateTicket);

// Mark ticket as used (for event organizers)
router.patch("/:ticketId/use", authRequired, useTicket);

// Test endpoint to create a sample ticket
router.post('/create-test-ticket', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('🎫 Creating test ticket for user:', userId);

    // Find any event created by the user or any available event
    const Event = (await import('../models/Event.js')).default;
    const Ticket = (await import('../models/Ticket.js')).default;

    const event = await Event.findOne().sort({ createdAt: -1 });

    if (!event) {
      return res.status(400).json({
        message: "No events found. Please create an event first to generate a test ticket."
      });
    }

    // Generate unique ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create test ticket
    const testTicket = new Ticket({
      ticketId,
      user: userId,
      event: event._id,
      ticketType: 'general',
      quantity: 1,
      status: 'active',
      isValid: true,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      downloadCount: 0,
      metadata: {
        testTicket: true,
        createdVia: 'test-endpoint',
        createdAt: new Date()
      }
    });

    console.log('💾 Saving test ticket to database:', {
      ticketId: testTicket.ticketId,
      userId: testTicket.user,
      eventId: testTicket.event,
      eventTitle: event.title
    });

    const savedTicket = await testTicket.save();

    console.log('✅ Test ticket created successfully:', {
      ticketId: savedTicket.ticketId,
      mongoId: savedTicket._id,
      createdAt: savedTicket.createdAt
    });

    // Populate the event details for response
    await savedTicket.populate('event', 'title date time location');

    res.json({
      success: true,
      message: "Test ticket created successfully!",
      ticket: {
        id: savedTicket._id,
        ticketId: savedTicket.ticketId,
        event: savedTicket.event,
        ticketType: savedTicket.ticketType,
        quantity: savedTicket.quantity,
        status: savedTicket.status,
        isValid: savedTicket.isValid,
        validUntil: savedTicket.validUntil,
        createdAt: savedTicket.createdAt,
        metadata: savedTicket.metadata
      }
    });

  } catch (error) {
    console.error('❌ Error creating test ticket:', error);
    res.status(500).json({
      message: "Failed to create test ticket",
      error: error.message
    });
  }
});

export default router;
