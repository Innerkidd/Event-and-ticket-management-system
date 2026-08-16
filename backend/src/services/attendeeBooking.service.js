const prisma = require('../config/prisma');

class BookingError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toBookingDto(booking) {
  return {
    id: booking.id,
    bookingId: booking.id,
    eventId: booking.event_id,
    eventName: booking.events?.name,
    eventDate: booking.events?.start_date,
    venue: booking.events?.venue,
    quantity: booking.quantity,
    unitPrice: Number(booking.unit_price),
    amount: Number(booking.total_amount),
    status: booking.status,
    bookingDate: booking.created_at,
  };
}

async function getAvailableTickets(eventId) {
  const event = await prisma.events.findUnique({ where: { id: Number(eventId) } });
  if (!event) throw new BookingError(404, 'Event not found');
  const soldRow = await prisma.bookings.aggregate({
    where: { event_id: event.id, status: { in: ['CONFIRMED', 'PENDING'] } },
    _sum: { quantity: true },
  });
  const sold = Number(soldRow._sum.quantity) || 0;
  return { event, available: Math.max(Number(event.total_tickets) - sold, 0) };
}

async function createBooking(userId, body = {}) {
  const { eventId, quantity } = body;

  if (eventId === undefined || eventId === null || eventId === '') {
    throw new BookingError(400, 'eventId is required');
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    throw new BookingError(400, 'quantity must be an integer of at least 1');
  }

  const { event, available } = await getAvailableTickets(eventId);
  if (event.status !== 'PUBLISHED') {
    throw new BookingError(409, 'Event is not available for booking');
  }
  if (qty > available) {
    throw new BookingError(409, `Only ${available} ticket(s) available for this event`);
  }

  const unitPrice = Number(event.ticket_price) || 0;
  const booking = await prisma.bookings.create({
    data: {
      user_id: userId,
      event_id: event.id,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: unitPrice * qty,
      status: 'PENDING',
    },
    include: { events: true },
  });

  return { booking: toBookingDto(booking) };
}

async function listMyBookings(userId) {
  const bookings = await prisma.bookings.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: { events: true },
  });

  return { bookings: bookings.map(toBookingDto) };
}

module.exports = {
  BookingError,
  createBooking,
  listMyBookings,
};