const organizerApplicationService = require('../services/organizerApplication.service');

function handleError(res, error, logPrefix) {
  if (error instanceof organizerApplicationService.AdminError) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  }
  console.error(`${logPrefix} failed:`, error.message);
  return res
    .status(500)
    .json({ success: false, message: 'Internal server error' });
}

async function listApplications(req, res) {
  try {
    const { status, search, page, limit } = req.query;
    const data = await organizerApplicationService.listApplications({ status, search, page, limit });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Admin applications list');
  }
}

async function getApplicationById(req, res) {
  try {
    const application = await organizerApplicationService.getApplicationById(req.params.id);
    return res.status(200).json({ success: true, data: { application } });
  } catch (error) {
    return handleError(res, error, 'Admin application detail');
  }
}

async function approveApplication(req, res) {
  try {
    const { adminRemarks } = req.body || {};
    const result = await organizerApplicationService.approveApplication(
      req.params.id,
      adminRemarks
    );
    return res.status(200).json({
      success: true,
      message: 'Organizer application approved',
      data: result,
    });
  } catch (error) {
    return handleError(res, error, 'Admin application approve');
  }
}

async function rejectApplication(req, res) {
  try {
    const { adminRemarks } = req.body || {};
    const application = await organizerApplicationService.rejectApplication(
      req.params.id,
      adminRemarks
    );
    return res.status(200).json({
      success: true,
      message: 'Organizer application rejected',
      data: { application },
    });
  } catch (error) {
    return handleError(res, error, 'Admin application reject');
  }
}

module.exports = {
  listApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
};