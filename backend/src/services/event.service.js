const eventModel = require('../models/event.model');

async function getUpcomingPublishedEvents() {
  const events = await eventModel.findUpcomingPublished();
  return events;
}

module.exports = {
  getUpcomingPublishedEvents,
};