const express = require('express');
const historyCallController = require('../controllers/history_call.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();


router.get('/my-history', authenticate, isVerified, historyCallController.getMyCallHistory);

module.exports = router;
