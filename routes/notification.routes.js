const express = require('express');
const notificationController = require('../controllers/notification.controller');
const {authenticate, isVerified} = require('../middleware/auth.middleware');

const router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticate);

router.get('/', isVerified, notificationController.getAllNotifications);
router.patch('/:notificationId/read', isVerified, notificationController.markAsRead);

module.exports = router;
