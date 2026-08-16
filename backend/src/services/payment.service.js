const paymentModel = require('../models/payment.model');

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

async function listPayments({ type, status, search, from, to, page, limit }) {
  const pagination = parsePagination(page, limit);
  const { payments, total } = await paymentModel.listPayments({
    type,
    status,
    search,
    from,
    to,
    ...pagination,
  });
  return {
    payments,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(Math.ceil(total / pagination.limit), 0),
    },
  };
}

async function getPaymentById(id) {
  const payment = await paymentModel.findById(id);
  if (!payment) {
    throw new AdminError('Payment not found', 404);
  }
  return payment;
}

module.exports = {
  listPayments,
  getPaymentById,
  AdminError,
};