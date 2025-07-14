const express = require('express');
const asteriskController = require('../controllers/asterisk.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/send-sip', isVerified, asteriskController.sendSip);
router.post('/call', isVerified, asteriskController.startCall);

module.exports = router;
