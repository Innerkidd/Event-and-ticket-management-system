const organizerService = require('../services/organizer.service');

function handleError(res, error) {
  if (error instanceof organizerService.OrganizerError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  console.error('Organizer API failed:', error.message);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

function wrap(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };
}

const getDashboard = wrap(async (req, res) => {
  const data = await organizerService.getDashboard(req.user.id);
  return res.status(200).json({ success: true, data });
});

const listEvents = wrap(async (req, res) => {
  const { search, status, page, limit } = req.query;
  const data = await organizerService.listEvents(req.user.id, { search, status, page, limit });
  return res.status(200).json({ success: true, data });
});

const getEvent = wrap(async (req, res) => {
  const data = await organizerService.getEvent(req.user.id, req.params.id);
  return res.status(200).json({ success: true, data });
});

const createEvent = wrap(async (req, res) => {
  const data = await organizerService.createEvent(req.user.id, req.body);
  return res.status(201).json({ success: true, data });
});

const updateEvent = wrap(async (req, res) => {
  const data = await organizerService.updateEvent(req.user.id, req.params.id, req.body);
  return res.status(200).json({ success: true, data });
});

const getPublishSummary = wrap(async (req, res) => {
  const data = await organizerService.getPublishSummary(req.user.id, req.params.id);
  return res.status(200).json({ success: true, data });
});

const createPublishOrder = wrap(async (req, res) => {
  const data = await organizerService.createPublishOrder(req.user.id, req.params.id);
  return res.status(200).json({ success: true, data });
});

const verifyPublishPayment = wrap(async (req, res) => {
  const result = await organizerService.verifyPublishPayment(req.user.id, req.params.id, req.body);
  return res.status(200).json({ success: true, message: result.message, data: result.data });
});

const listTickets = wrap(async (req, res) => {
  const { status, page, limit } = req.query;
  const data = await organizerService.listTickets(req.user.id, { status, page, limit });
  return res.status(200).json({ success: true, data });
});

const getEventTickets = wrap(async (req, res) => {
  const data = await organizerService.getEventTickets(req.user.id, req.params.id);
  return res.status(200).json({ success: true, data });
});

const listBookings = wrap(async (req, res) => {
  const { search, eventId, status, from, to, page, limit } = req.query;
  const data = await organizerService.listBookings(req.user.id, { search, eventId, status, from, to, page, limit });
  return res.status(200).json({ success: true, data });
});

const getBooking = wrap(async (req, res) => {
  const data = await organizerService.getBooking(req.user.id, req.params.id);
  return res.status(200).json({ success: true, data });
});

const listStaff = wrap(async (req, res) => {
  const { eventId, status, search, page, limit } = req.query;
  const data = await organizerService.listStaff(req.user.id, { eventId, status, search, page, limit });
  return res.status(200).json({ success: true, data });
});

const createStaff = wrap(async (req, res) => {
  const data = await organizerService.createStaff(req.user.id, req.body);
  return res.status(201).json({ success: true, data });
});

const updateStaff = wrap(async (req, res) => {
  const data = await organizerService.updateStaff(req.user.id, req.params.id, req.body);
  return res.status(200).json({ success: true, data });
});

const removeStaff = wrap(async (req, res) => {
  const result = await organizerService.removeStaff(req.user.id, req.params.id);
  return res.status(200).json({ success: true, message: result.message, data: result.data });
});

const getAttendanceOverview = wrap(async (req, res) => {
  const data = await organizerService.getAttendanceOverview(req.user.id, req.query.eventId);
  return res.status(200).json({ success: true, data });
});

const getAttendanceTable = wrap(async (req, res) => {
  const { page, limit } = req.query;
  const data = await organizerService.getAttendanceTable(req.user.id, req.params.id, { page, limit });
  return res.status(200).json({ success: true, data });
});

const checkIn = wrap(async (req, res) => {
  const result = await organizerService.checkIn(req.user.id, req.params.bookingId);
  return res.status(200).json({ success: true, message: result.message, data: result.data });
});

const getAnalytics = wrap(async (req, res) => {
  const data = await organizerService.getAnalytics(req.user.id, req.query.eventId);
  return res.status(200).json({ success: true, data });
});

module.exports = {
  getDashboard,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  getPublishSummary,
  createPublishOrder,
  verifyPublishPayment,
  listTickets,
  getEventTickets,
  listBookings,
  getBooking,
  listStaff,
  createStaff,
  updateStaff,
  removeStaff,
  getAttendanceOverview,
  getAttendanceTable,
  checkIn,
  getAnalytics,
};