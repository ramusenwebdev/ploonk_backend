const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/create', isVerified, appointmentController.createAppointment);
router.post('/:id/call', isVerified, appointmentController.startCall);

module.exports = router;
