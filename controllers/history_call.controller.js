const { HistoryCall, Agent } = require('../db/models');

exports.getMyCallHistory = async (req, res) => {
  try {
    const history = await HistoryCall.findAll({
      where: { user_id: req.user.id },
      include: {
        model: Agent,
        as: 'agent',
        attributes: ['id', 'name']
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: {
        history
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
