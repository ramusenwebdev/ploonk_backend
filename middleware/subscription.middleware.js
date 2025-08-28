// middlewares/requireSubscription.js
const dayjs = require('dayjs');

/**
 * @param {Number|String} minLevel ‑ akses minimum (mis. 1 = basic, 2 = premium)
 *                                 atau 'premium' / 'basic' jika pakai enum string.
 *                                 Default: 1 (hanya perlu subscription aktif).
 */
const requireSubscription = (minLevel = 1) => async (req, res, next) => {
    try {
    if (!req.user.subscription) {
      return res.status(403).json({
        status: 'fail',
        message: 'Anda belum memiliki langganan aktif.',
      });
    }

    const subscription = req.user.subscription;
    const package = req.user.subscription.package;

    const { status, start_date, end_date, sessions_remaining, duration_remaining } = subscription;
    const { access_level } = package;


    // // ①  Cek kedaluwarsa
    const isExpired = start_date && dayjs(end_date).isBefore(dayjs());
    if (isExpired) {
      return res.status(403).json({
        status: 'fail',
        message: 'Langganan Anda sudah kedaluwarsa.',
      });
    }


    if (status != 'active') {
      return res.status(403).json({
        status: 'fail',
        message: 'Langganan Anda sudah tidak valid.',
      });
    }

    // ② Cek durasi dan sesi tersisa
    if (sessions_remaining <= 0 || duration_remaining <= 0) {
      return res.status(403).json({
        status: 'fail',
        message: 'Langganan Anda tidak memiliki sesi atau durasi yang tersisa.',
      });
    }

    // ③ Cek level akses
    const levelOk =
      typeof access_level === 'number'
        ? access_level >= minLevel
        : access_level === minLevel;

    if (!levelOk) {
      return res.status(403).json({
        status: 'fail',
        message: 'Fitur ini hanya tersedia untuk pengguna paket lebih tinggi.',
      });
    }
    // ③  Semua OK → lanjut
    next();
    } catch (error) {
        console.error(error.message);
        return res.status(401).json({
        status: 'fail',
        message: 'Token tidak valid atau sudah kedaluwarsa.',
        });
    }
    
  };

module.exports = requireSubscription;
