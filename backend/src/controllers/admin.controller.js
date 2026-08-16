const adminService = require('../services/admin.service');

async function getDashboard(req, res) {
  try {
    const data = await adminService.getDashboard();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin dashboard failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getUsers(req, res) {
  try {
    const { search, role, page, limit } = req.query;
    const data = await adminService.getUsers({ search, role, page, limit });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin users failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getOrganizers(req, res) {
  try {
    const data = await adminService.getOrganizers();
    return res.status(200).json({ success: true, data: { organizers: data } });
  } catch (error) {
    console.error('Admin organizers failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getEvents(req, res) {
  try {
    const { search, status, organizer, from, to, page, limit } = req.query;
    const data = await adminService.getEvents({ search, status, organizer, from, to, page, limit });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin events failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getEventById(req, res) {
  try {
    const event = await adminService.getEventById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, data: { event } });
  } catch (error) {
    console.error('Admin event detail failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getReports(req, res) {
  try {
    const data = await adminService.getReports();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin reports failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getDashboard,
  getUsers,
  getOrganizers,
  getEvents,
  getEventById,
  getReports,
};