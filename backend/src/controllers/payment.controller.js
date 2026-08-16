const paymentService = require('../services/payment.service');

async function listPayments(req, res) {
  try {
    const { type, status, search, from, to, page, limit } = req.query;
    const data = await paymentService.listPayments({ type, status, search, from, to, page, limit });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error instanceof paymentService.AdminError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Admin payments failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getPaymentById(req, res) {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    return res.status(200).json({ success: true, data: { payment } });
  } catch (error) {
    if (error instanceof paymentService.AdminError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Admin payment detail failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function getOrganizerFees(req, res) {
  return res.status(200).json({ success: true, data: [] });
}

module.exports = {
  listPayments,
  getPaymentById,
  getOrganizerFees,
};