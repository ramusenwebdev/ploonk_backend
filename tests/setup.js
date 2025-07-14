// tests/setup.js
require('dotenv').config({ path: '.env.test' });
const { sequelize } = require('../db/models');

module.exports = async () => {
  try {
    console.log('\nJest Global Setup: Synchronizing test database...');

    await sequelize.sync({ force: true });
    console.log('Jest Global Setup: Test database synchronized successfully.');
    await sequelize.close(); // Tutup koneksi setelah setup selesai
  } catch (error) {
    console.error('Jest Global Setup: Failed to sync test database.', error);
    process.exit(1);
  }
};
