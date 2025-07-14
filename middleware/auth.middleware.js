const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../db/models');

exports.authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Anda belum login. Silakan login untuk mendapatkan akses.',
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'User yang memiliki token ini sudah tidak ada.',
      });
    }
    
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid atau sudah kedaluwarsa.',
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles adalah array, misal ['admin', 'moderator']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Anda tidak memiliki izin untuk melakukan aksi ini.'
      });
    }
    next();
  };
};

exports.isVerified = (req, res, next) => {
  // Middleware ini harus dijalankan SETELAH middleware 'authenticate'.
  // Ia memeriksa properti 'is_verified' pada objek req.user.
  if (!req.user || !req.user.is_verified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Akses ditolak. Akun Anda belum diverifikasi.',
    });
  }
  // Jika user sudah terverifikasi, lanjutkan ke controller berikutnya.
  next();
};