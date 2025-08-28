const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { sequelize } = require('./db/models');
// require('./services/asterisk.service');
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database PostgreSQL berhasil.');

    app.listen(PORT, () => {
      console.log(`Server berjalan di port ${PORT}...`);
    });
  } catch (error) {
    console.error('Tidak dapat terhubung ke database:', error);
  }
};

startServer();
