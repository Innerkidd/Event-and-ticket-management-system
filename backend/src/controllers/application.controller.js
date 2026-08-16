const applicationService = require('../services/application.service');

async function createOrganizerApplication(req, res) {
  try {
    const data = await applicationService.createOrganizerApplication(req.user.id, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    if (error instanceof applicationService.ApplicationError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Organizer application creation failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  createOrganizerApplication,
};