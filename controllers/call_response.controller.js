const { CallResponse } = require('../db/models');

exports.getAllCallResponses = async (req, res) => {
  try {
    const callResponses = await CallResponse.findAll();
    console.log('Fetched call responses:', callResponses);
    res.status(200).json({
      status: 'success',
        message: 'Call responses fetched successfully',
      data: { 'call_responses' : callResponses }
    });
  } catch (error) {
    console.error('Error fetching call responses:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}