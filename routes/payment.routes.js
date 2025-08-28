const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();


router.get('/my-payments',authenticate, isVerified, paymentController.getMyPayments);

module.exports = router;
