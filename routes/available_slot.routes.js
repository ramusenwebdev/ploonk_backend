const express = require('express');
const slotController = require('../controllers/available_slot.controller');
const { authenticate, restrictTo, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();

// Rute untuk Create dan Read (List)
router.route('/')
  .post(authenticate, restrictTo('admin'), slotController.createSlot) // Admin
  .get(slotController.getAllSlots); // Publik

// Rute untuk Read (Detail), Update, dan Delete
router.route('/:id')
  .get(slotController.getSlotById) // Publik
  .patch(authenticate, isVerified, slotController.updateSlot) // Admin
  .delete(authenticate, restrictTo('admin'), slotController.deleteSlot); // Admin

module.exports = router;
