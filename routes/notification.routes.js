const express = require('express');
const notificationController = require('../controllers/notification.controller');
const {authenticate, isVerified} = require('../middleware/auth.middleware');

const router = express.Router();


router.get('/', authenticate, notificationController.getAllNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.patch('/read-all',authenticate, notificationController.markAsReadAll);


module.exports = router;
