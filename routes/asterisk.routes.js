const express = require('express');
const asteriskController = require('../controllers/asterisk.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');
const requireSubscription = require('../middleware/subscription.middleware');

const router = express.Router();

router.get('/send-sip',  authenticate, isVerified, requireSubscription(1), asteriskController.sendSip);
router.post('/call', authenticate, isVerified, requireSubscription(1), asteriskController.startCall);

module.exports = router;
