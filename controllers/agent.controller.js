const { Agent } = require('../db/models');


exports.getAllAgents = async (req, res) => {
  try {
    
    const agents = await Agent.findAll({ order: [['name', 'ASC']] });
    res.status(200).json({
      status: 'success',
      results: agents.length,
      data: {
        agents
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


exports.createAgent = async (req, res) => {
  try {
    const newAgent = await Agent.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        agent: newAgent
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    if (!agent) {
      return res.status(404).json({ status: 'fail', message: 'Agent tidak ditemukan.' });
    }
    const updatedAgent = await agent.update(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        agent: updatedAgent
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    if (!agent) {
      return res.status(404).json({ status: 'fail', message: 'Agent tidak ditemukan.' });
    }
    await agent.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getAvailableAgents = async (req, res) => {
    try {
        const {access_level} = req.user.subscription.package;

        const agents = await Agent.findAll({ where: {status: 'available'}, order: [['name', 'ASC']] });

        let visibleAgents = agents;

        if (access_level === 1) {
            visibleAgents = agents.slice(0, 2);
        }
        
        res.status(200).json({
            status: 'success',
            visibleResults: visibleAgents.length,
            totalAvailable: agents.length
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: 'error', message: error.message });
        
    }
}
