const express = require('express');
const purchaseController = require('../controllers/purchase.controller');
const { authenticate, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/my-purchases', purchaseController.getMyPurchases);

router.route('/')
    .get(restrictTo('admin'), purchaseController.getAllPurchases);

router.route('/:id')
    .patch(restrictTo('admin'), purchaseController.updatePurchaseStatus);

module.exports = router;
