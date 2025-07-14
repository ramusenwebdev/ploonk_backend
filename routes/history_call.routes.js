const express = require('express');
const historyCallController = require('../controllers/history_call.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticate);

router.get('/my-history', isVerified, historyCallController.getMyCallHistory);

module.exports = router;
