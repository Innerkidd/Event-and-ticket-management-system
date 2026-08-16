const bookingService = require('../services/booking.service');

async function listBookings(req, res) {
  try {
    const { search, eventId, organizer, status, from, to, page, limit } = req.query;
    const data = await bookingService.listBookings({ search, eventId, organizer, status, from, to, page, limit });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error instanceof bookingService.AdminError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Admin bookings failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getBookingById(req, res) {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    return res.status(200).json({ success: true, data: { booking } });
  } catch (error) {
    if (error instanceof bookingService.AdminError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Admin booking detail failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  listBookings,
  getBookingById,
};