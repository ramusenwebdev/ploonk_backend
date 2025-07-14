const { Purchase, Package } = require('../db/models');

// Membuat pembelian baru
// exports.createPurchase = async (req, res) => {
//   try {
//     const { package_id } = req.body;
//     const user_id = req.user.id;

//     // 1. Cari paket yang akan dibeli
//     const selectedPackage = await Package.findByPk(package_id);
//     if (!selectedPackage) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'Paket tidak ditemukan.'
//       });
//     }

//     // 2. Buat entri pembelian baru
//     const newPurchase = await Purchase.create({
//       user_id,
//       package_id,
//       sessions_remaining: selectedPackage.session_count,
//       purchase_date: new Date(),
//       status: 'active'
//     });

//     res.status(201).json({
//       status: 'success',
//       data: {
//         purchase: newPurchase
//       }
//     });

//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: error.message
//     });
//   }
// };

// Mendapatkan riwayat pembelian user yang sedang login
exports.getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      where: { user_id: req.user.id },
      include: {
        model: Package, // Sertakan detail paket dalam respons
        as: 'package'
      },
      order: [['purchase_date', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      results: purchases.length,
      data: {
        purchases
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Package, as: 'package' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ status: 'success', data: { purchases } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};


exports.updatePurchaseStatus = async (req, res) => {
    try {
        const { status, payment_status, sessions_remaining } = req.body;
        const purchase = await Purchase.findByPk(req.params.id);

        if (!purchase) {
            return res.status(404).json({ status: 'fail', message: 'Data pembelian tidak ditemukan.' });
        }

        const updatedPurchase = await purchase.update({
            status,
            payment_status,
            sessions_remaining
        });

        res.status(200).json({ status: 'success', data: { purchase: updatedPurchase } });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};