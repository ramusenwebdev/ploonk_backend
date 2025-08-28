const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');
const requireSubscription = require('../middleware/subscription.middleware');

const router = express.Router();

router.get('/',authenticate, isVerified, requireSubscription(1), appointmentController.getAppointment);
router.post('/create', authenticate, isVerified, requireSubscription(1), appointmentController.createAppointment);
router.post('/:id/call', authenticate, isVerified, requireSubscription(1), appointmentController.startCall);

module.exports = router;
