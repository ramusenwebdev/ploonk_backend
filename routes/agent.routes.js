const express = require('express');
const agentController = require('../controllers/agent.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');
const requireSubscription = require('../middleware/subscription.middleware');

const router = express.Router();


router.get('/availables', authenticate, isVerified, requireSubscription(1), agentController.getAvailableAgents);


module.exports = router;
