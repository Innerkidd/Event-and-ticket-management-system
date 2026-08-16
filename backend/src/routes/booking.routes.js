const express = require('express');

const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.listMyBookings);

module.exports = router;