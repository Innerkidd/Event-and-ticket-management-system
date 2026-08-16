const pool = require('../config/db');

const organizerApplicationModel = require('../models/organizerApplication.model');
const userModel = require('../models/user.model');

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

async function listApplications({ status, search, page, limit }) {
  const pagination = parsePagination(page, limit);
  const { applications, total } = await organizerApplicationModel.listApplications({
    status,
    search,
    ...pagination,
  });
  return {
    applications,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(Math.ceil(total / pagination.limit), 0),
    },
  };
}

async function getApplicationById(id) {
  const application = await organizerApplicationModel.findById(id);
  if (!application) {
    throw new AdminError('Application not found', 404);
  }
  return application;
}

async function approveApplication(applicationId, adminRemarks) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const application = await organizerApplicationModel.findById(applicationId);
    if (!application) {
      throw new AdminError('Application not found', 404);
    }
    if (application.status !== 'PENDING') {
      throw new AdminError('Only pending applications can be approved', 409);
    }

    const user = await userModel.findById(application.user_id);
    if (!user) {
      throw new AdminError('Associated user not found', 404);
    }

    await client.query(
      `UPDATE users SET role = 'ORGANIZER', updated_at = NOW() WHERE id = $1`,
      [user.id]
    );
    await organizerApplicationModel.approveApplication(client, applicationId, adminRemarks);

    await client.query('COMMIT');

    return {
      application: await organizerApplicationModel.findById(applicationId),
      user: await userModel.findById(user.id),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function rejectApplication(applicationId, adminRemarks) {
  const application = await organizerApplicationModel.findById(applicationId);
  if (!application) {
    throw new AdminError('Application not found', 404);
  }
  if (application.status !== 'PENDING') {
    throw new AdminError('Only pending applications can be rejected', 409);
  }

  const updated = await organizerApplicationModel.rejectApplication(applicationId, adminRemarks);
  return updated;
}

module.exports = {
  listApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  AdminError,
};