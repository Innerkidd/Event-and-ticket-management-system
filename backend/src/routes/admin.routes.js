const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin.controller');
const organizerApplicationController = require('../controllers/organizerApplication.controller');
const bookingController = require('../controllers/booking.controller');
const paymentController = require('../controllers/payment.controller');

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getUsers);

// Organizers
router.get('/organizers', adminController.getOrganizers);
router.get('/organizers/applications', organizerApplicationController.listApplications);
router.get('/organizers/applications/:id', organizerApplicationController.getApplicationById);
router.patch('/organizers/applications/:id/approve', organizerApplicationController.approveApplication);
router.patch('/organizers/applications/:id/reject', organizerApplicationController.rejectApplication);

// Events
router.get('/events', adminController.getEvents);
router.get('/events/:id', adminController.getEventById);

// Bookings
router.get('/bookings', bookingController.listBookings);
router.get('/bookings/:id', bookingController.getBookingById);

// Payments
router.get('/payments/organizer-fees', paymentController.getOrganizerFees);
router.get('/payments', paymentController.listPayments);
router.get('/payments/:id', paymentController.getPaymentById);

// Reports
router.get('/reports', adminController.getReports);

module.exports = router;