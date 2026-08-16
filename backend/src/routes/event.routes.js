const express = require('express');

const router = express.Router();

const eventController = require('../controllers/event.controller');

router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEventById);

module.exports = router;