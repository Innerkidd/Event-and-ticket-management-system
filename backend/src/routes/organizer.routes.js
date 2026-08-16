const express = require('express');

const router = express.Router();

const organizerController = require('../controllers/organizer.controller');

// Dashboard
router.get('/dashboard', organizerController.getDashboard);

// Events
router.get('/events', organizerController.listEvents);
router.post('/events', organizerController.createEvent);
router.get('/events/:id', organizerController.getEvent);
router.patch('/events/:id', organizerController.updateEvent);
router.get('/events/:id/publish-summary', organizerController.getPublishSummary);
router.post('/events/:id/publish-payment', organizerController.createPublishOrder);
router.post('/events/:id/publish-payment/verify', organizerController.verifyPublishPayment);
router.get('/events/:id/tickets', organizerController.getEventTickets);
router.get('/events/:id/attendance', organizerController.getAttendanceTable);

// Tickets
router.get('/tickets', organizerController.listTickets);

// Bookings
router.get('/bookings', organizerController.listBookings);
router.get('/bookings/:id', organizerController.getBooking);

// Staff
router.get('/staff', organizerController.listStaff);
router.post('/staff', organizerController.createStaff);
router.patch('/staff/:id', organizerController.updateStaff);
router.delete('/staff/:id', organizerController.removeStaff);

// Attendance
router.get('/attendance', organizerController.getAttendanceOverview);
router.patch('/attendance/:bookingId/check-in', organizerController.checkIn);

// Analytics
router.get('/analytics', organizerController.getAnalytics);

module.exports = router;