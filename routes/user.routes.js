const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Terapkan middleware 'authenticate' pada rute ini.
// Setiap request ke GET /api/v1/users/me akan melewati middleware ini terlebih dahulu.
router.get('/me', authMiddleware.authenticate, authMiddleware.isVerified, userController.getMe);

module.exports = router;
