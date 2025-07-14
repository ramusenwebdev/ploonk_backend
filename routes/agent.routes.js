const express = require('express');
const agentController = require('../controllers/agent.controller');
const { authenticate, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/availables', agentController.getAvailableAgents);

router.use(restrictTo('admin'));

router.post('/', agentController.createAgent);
router.route('/:id')
  .patch(agentController.updateAgent)
  .delete(agentController.deleteAgent);

module.exports = router;
