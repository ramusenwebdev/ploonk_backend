const express = require('express');
const slotController = require('../controllers/schedule.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');
const requireSubscription = require('../middleware/subscription.middleware');

const router = express.Router();
router.route('/')
  .get(authenticate, isVerified, requireSubscription(1), slotController.getAllSchedules)
  .post(authenticate, isVerified, requireSubscription(1), slotController.createSchedule);


module.exports = router;
