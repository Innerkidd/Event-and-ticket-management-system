const express = require('express');

const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.listMyBookings);
router.post('/:bookingId/payment', authenticate, bookingController.createTicketPaymentOrder);
router.post('/:bookingId/payment/verify', authenticate, bookingController.verifyTicketPayment);

module.exports = router;