const { Package } = require('../db/models');



exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();
    console.log('Fetched packages:', packages);
    res.status(200).json({
      status: 'success',
      results: packages.length,
      data: {
        packages
      }
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
