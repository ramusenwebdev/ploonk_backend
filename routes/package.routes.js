const express = require('express');
const packageController = require('../controllers/package.controller');
const { authenticate, restrictTo, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', isVerified, packageController.getAllPackages);

// Rute yang memerlukan login

// Rute yang hanya bisa diakses oleh admin
router
  .route('/')
  .post(restrictTo('admin'), packageController.createPackage);

module.exports = router;
