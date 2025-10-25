import { validationResult } from 'express-validator';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Issue ticket after payment
// @route   POST /api/v1/tickets/issue
// @access  Private
export const issueTicket = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { attendeeId, eventId, seatNo, category, price } = req.body;

  // Check if event exists and has available seats
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Event is not active'
    });
  }

  // Check if seat is available
  const existingTicket = await Ticket.findOne({ event: eventId, seatNo });
  if (existingTicket) {
    return res.status(400).json({
      success: false,
      message: 'Seat is already taken'
    });
  }

  // Create ticket
  const ticket = await Ticket.create({
    attendee: attendeeId,
    event: eventId,
    seatNo,
    category,
    price,
    status: 'active',
    issuedAt: new Date()
  });

  // Update event analytics
  await Event.findByIdAndUpdate(eventId, {
    $inc: {
      'analytics.ticketsSold': 1,
      'analytics.attendees': 1
    }
  });

  res.status(201).json({
    success: true,
    message: 'Ticket issued successfully',
    data: { ticket }
  });
});

// @desc    Get user's tickets
// @route   GET /api/v1/tickets/:userId
// @access  Private
export const getUserTickets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, eventId } = req.query;

  console.log('getUserTickets called with userId:', userId);
  console.log('Request user from token:', req.user);

  // Check if user is requesting their own tickets or is admin
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    console.log('Authorization failed: userId mismatch');
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these tickets'
    });
  }

  const query = { attendee: userId };
  if (status) query.status = status;
  if (eventId) query.event = eventId;

  console.log('Query:', query);

  const tickets = await Ticket.find(query)
    .populate({
      path: 'event',
      select: 'name startDate',
      populate: {
        path: 'venue',
        select: 'name'
      }
    })
    .populate('payment', 'amount status date')
    .sort({ issuedAt: -1 })
    .lean();

  console.log('Found tickets:', tickets.length);
  console.log('Tickets data:', tickets);

  res.json({
    success: true,
    data: { tickets }
  });
});

// @desc    Get ticket details
// @route   GET /api/v1/tickets/detail/:ticketId
// @access  Private
export const getTicketDetails = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId)
    .populate('attendee', 'name email phone')
    .populate({
      path: 'event',
      select: 'name startDate description',
      populate: {
        path: 'venue',
        select: 'name'
      }
    })
    .populate('payment', 'amount status date mode');

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if user is authorized to view this ticket
  if (ticket.attendee._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this ticket'
    });
  }

  res.json({
    success: true,
    data: { ticket }
  });
});

// @desc    Cancel ticket
// @route   PUT /api/v1/tickets/:ticketId/cancel
// @access  Private
export const cancelTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { reason } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if user owns the ticket or is admin
  if (ticket.attendee.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this ticket'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Ticket cannot be cancelled'
    });
  }

  // Check if event allows cancellation (not too close to event date)
  const eventDate = new Date(ticket.event.startDate);
  const now = new Date();
  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

  if (hoursUntilEvent < 24) {
    return res.status(400).json({
      success: false,
      message: 'Tickets cannot be cancelled less than 24 hours before the event'
    });
  }

  // Cancel ticket
  ticket.status = 'cancelled';
  ticket.cancelledAt = new Date();
  ticket.cancellationReason = reason;
  await ticket.save();

  // Update event analytics
  await Event.findByIdAndUpdate(ticket.event._id, {
    $inc: {
      'analytics.ticketsSold': -1,
      'analytics.attendees': -1
    }
  });

  res.json({
    success: true,
    message: 'Ticket cancelled successfully',
    data: { ticket }
  });
});

// @desc    Transfer ticket
// @route   PUT /api/v1/tickets/:ticketId/transfer
// @access  Private
export const transferTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { newAttendeeId } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if user owns the ticket
  if (ticket.attendee.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to transfer this ticket'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Ticket cannot be transferred'
    });
  }

  // Check if event allows transfers (not too close to event date)
  const eventDate = new Date(ticket.event.startDate);
  const now = new Date();
  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

  if (hoursUntilEvent < 48) {
    return res.status(400).json({
      success: false,
      message: 'Tickets cannot be transferred less than 48 hours before the event'
    });
  }

  // Transfer ticket
  ticket.attendee = newAttendeeId;
  ticket.transferredAt = new Date();
  await ticket.save();

  res.json({
    success: true,
    message: 'Ticket transferred successfully',
    data: { ticket }
  });
});

// @desc    Get event tickets (for organizers)
// @route   GET /api/v1/tickets/event/:eventId
// @access  Private (Organizer/Admin)
export const getEventTickets = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status, category } = req.query;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view event tickets'
    });
  }

  const query = { event: eventId };
  if (status) query.status = status;
  if (category) query.category = category;

  const tickets = await Ticket.find(query)
    .populate('attendee', 'name email phone')
    .populate('payment', 'amount status date')
    .sort({ issuedAt: -1 });

  res.json({
    success: true,
    data: { tickets }
  });
});

// @desc    Download ticket as PDF
// @route   GET /api/v1/tickets/:ticketId/download
// @access  Private
export const downloadTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId)
    .populate('attendee', 'name email')
    .populate({
      path: 'event',
      select: 'name startDate',
      populate: {
        path: 'venue',
        select: 'name'
      }
    })
    .populate('payment', 'amount status');

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if user is authorized to download this ticket
  if (ticket.attendee._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to download this ticket'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Ticket is not active'
    });
  }

  try {
    // Generate HTML content for the ticket
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ticket - ${ticket.ticketNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            min-height: 100vh;
          }
          .ticket-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
            border: 2px solid #22c55e;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
          }
          .ticket-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%);
            pointer-events: none;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
          }
          .event-title {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(45deg, #22c55e, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .ticket-number {
            font-size: 16px;
            color: #94a3b8;
            background: rgba(34, 197, 94, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
            display: inline-block;
          }
          .ticket-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          .detail-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(34, 197, 94, 0.2);
          }
          .detail-label {
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 16px;
            font-weight: bold;
            color: white;
          }
          .qr-section {
            text-align: center;
            margin: 30px 0;
          }
          .qr-code {
            background: white;
            padding: 15px;
            border-radius: 10px;
            display: inline-block;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          .qr-code img {
            width: 150px;
            height: 150px;
            display: block;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(34, 197, 94, 0.2);
          }
          .footer-text {
            font-size: 12px;
            color: #94a3b8;
            margin-bottom: 10px;
          }
          .valid-badge {
            background: linear-gradient(45deg, #22c55e, #16a34a);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
          }
          .perforation {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 20px;
            background: linear-gradient(90deg, transparent 0%, #0f172a 20%, transparent 40%, #0f172a 60%, transparent 80%, #0f172a 100%);
            transform: translateX(-50%);
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="perforation"></div>
          <div class="header">
            <h1 class="event-title">${ticket.event.name}</h1>
            <div class="ticket-number">Ticket #${ticket.ticketNumber}</div>
          </div>

          <div class="ticket-details">
            <div class="detail-item">
              <div class="detail-label">Attendee</div>
              <div class="detail-value">${ticket.attendee.name}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Seat</div>
              <div class="detail-value">${ticket.seatNo} (${ticket.category})</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date & Time</div>
              <div class="detail-value">${new Date(ticket.event.startDate).toLocaleDateString()} ${new Date(ticket.event.startDate).toLocaleTimeString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Venue</div>
              <div class="detail-value">${ticket.event.venue.name}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Price</div>
              <div class="detail-value">₹${ticket.price}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">${ticket.status.toUpperCase()}</div>
            </div>
          </div>

          <div class="qr-section">
            <div class="qr-code">
              <img src="${ticket.qrCode}" alt="QR Code" />
            </div>
            <div class="valid-badge">VALID TICKET</div>
          </div>

          <div class="footer">
            <div class="footer-text">Please present this ticket at the venue entrance</div>
            <div class="footer-text">This ticket is non-transferable and must be presented with valid ID</div>
            <div class="footer-text">Generated on ${new Date().toLocaleString()}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Set headers for PDF download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.ticketNumber}.html"`);

    // Send the HTML content
    res.send(ticketHtml);

  } catch (error) {
    console.error('Error generating ticket download:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating ticket download'
    });
  }
});

// @desc    Validate ticket (for entry)
// @route   POST /api/v1/tickets/validate
// @access  Private (Staff/Admin)
export const validateTicket = asyncHandler(async (req, res) => {
  const { ticketId, eventId } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  if (ticket.event._id.toString() !== eventId) {
    return res.status(400).json({
      success: false,
      message: 'Ticket does not belong to this event'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: `Ticket is ${ticket.status}`
    });
  }

  // Check if ticket has been used
  if (ticket.checkIn?.checkedIn) {
    return res.status(400).json({
      success: false,
      message: 'Ticket has already been used'
    });
  }

  // Mark ticket as used
  ticket.checkIn.checkedIn = true;
  ticket.checkIn.checkedInAt = new Date();
  ticket.checkIn.checkedInBy = req.user._id;
  ticket.status = 'used';
  await ticket.save();

  res.json({
    success: true,
    message: 'Ticket validated successfully',
    data: {
      ticketId: ticket._id,
      attendee: ticket.attendee,
      seatNo: ticket.seatNo,
      category: ticket.category
    }
  });
});