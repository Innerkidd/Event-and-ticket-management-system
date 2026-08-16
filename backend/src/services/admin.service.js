const adminModel = require('../models/admin.model');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function parsePagination(page, limit) {
  const parsedPage = Math.max(parseInt(page, 10) || DEFAULT_PAGE, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1), 100);
  return { page: parsedPage, limit: parsedLimit };
}

function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 0),
  };
}

async function getDashboard() {
  return adminModel.getDashboardStats();
}

async function getUsers({ search, role, page, limit }) {
  const pagination = parsePagination(page, limit);
  const { users, total } = await adminModel.listUsers({
    search,
    role,
    ...pagination,
  });
  return { users, pagination: buildPagination(pagination.page, pagination.limit, total) };
}

async function getOrganizers() {
  return adminModel.listOrganizers();
}

async function getEvents({ search, status, organizer, from, to, page, limit }) {
  const pagination = parsePagination(page, limit);
  const { events, total } = await adminModel.listEvents({
    search,
    status,
    organizer,
    from,
    to,
    ...pagination,
  });
  return { events, pagination: buildPagination(pagination.page, pagination.limit, total) };
}

async function getEventById(id) {
  return adminModel.findEventById(id);
}

async function getReports() {
  return adminModel.getReports();
}

module.exports = {
  getDashboard,
  getUsers,
  getOrganizers,
  getEvents,
  getEventById,
  getReports,
};