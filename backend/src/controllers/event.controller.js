const eventService = require('../services/event.service');

async function getEvents(req, res) {
  try {
    const events = await eventService.getUpcomingPublishedEvents();
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getEventById(req, res) {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getEvents,
  getEventById,
};