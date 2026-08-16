const bookingModel = require('../models/booking.model');

class AdminError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function parsePagination(page, limit) {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  return { page: parsedPage, limit: parsedLimit };
}

async function listBookings({ search, eventId, organizer, status, from, to, page, limit }) {
  const pagination = parsePagination(page, limit);
  const { bookings, total, summary } = await bookingModel.listBookings({
    search,
    eventId,
    organizer,
    status,
    from,
    to,
    ...pagination,
  });
  return {
    bookings,
    summary,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(Math.ceil(total / pagination.limit), 0),
    },
  };
}

async function getBookingById(id) {
  const booking = await bookingModel.findById(id);
  if (!booking) {
    throw new AdminError('Booking not found', 404);
  }
  return booking;
}

module.exports = {
  listBookings,
  getBookingById,
  AdminError,
};