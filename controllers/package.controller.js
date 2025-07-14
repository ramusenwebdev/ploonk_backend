const { Package } = require('../db/models');

// Membuat package baru (hanya admin)
exports.createPackage = async (req, res) => {
  try {
    const newPackage = await Package.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        package: newPackage
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mendapatkan semua package (publik)
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();
    console.log('Fetched packages:', packages); // Debugging log
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
