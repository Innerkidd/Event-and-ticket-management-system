const eventModel = require('../models/event.model');

async function getUpcomingPublishedEvents() {
  const events = await eventModel.findUpcomingPublished();
  return events;
}

async function getEventById(id) {
  return eventModel.findById(id);
}

module.exports = {
  getUpcomingPublishedEvents,
  getEventById,
};