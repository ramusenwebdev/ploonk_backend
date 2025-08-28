const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User, Subscription, Package } = require('../db/models');

exports.authenticate = async (req, res, next) => {
    console.log('Fetching user profile for:', req.user);

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

    const currentUser = await User.findByPk(decoded.id,
        {
            attributes: ['id', 'name', 'email', 'is_verified'],
            include : {
                model: Subscription, as :'subscription',
                    attributes: ['sessions_remaining', 'start_date', 'end_date', 'duration_remaining', 'status', 'id'],
                include: {
                    model: Package,
                    as: 'package',
                    attributes: ['access_level']
                },
            }
        });
        
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'User yang memiliki token ini sudah tidak ada.',
      });
    }
    
    req.user = currentUser;
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid atau sudah kedaluwarsa.',
    });
  }
};

exports.isVerified = (req, res, next) => {

  if (!req.user || !req.user.is_verified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Akses ditolak. Akun Anda belum diverifikasi.',
    });
  }
  next();
};
