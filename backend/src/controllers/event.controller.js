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

module.exports = {
  getEvents,
};