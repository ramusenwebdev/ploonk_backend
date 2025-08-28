const express = require('express');
const userController = require('../controllers/user.controller');
const {isVerified, authenticate} = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate, isVerified)
router.get('/me', userController.getProfile);

module.exports = router;
