const express = require('express');
const callResponseController = require('../controllers/call_response.controller.js');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();


router.get('/', authenticate, isVerified, callResponseController.getAllCallResponses);

module.exports = router;
