const express = require('express');

const router = express.Router();

const applicationController = require('../controllers/application.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/organizer', authenticate, applicationController.createOrganizerApplication);

module.exports = router;