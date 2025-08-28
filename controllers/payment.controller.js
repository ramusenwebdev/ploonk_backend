const { Payment, Package } = require('../db/models');


exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      include: {
        model: Package,
        as: 'package'
      },
      order: [['payment_date', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        payments
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Package, as: 'package' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ status: 'success', data: { payments } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};


exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status, payment_status, sessions_remaining } = req.body;
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) {
            return res.status(404).json({ status: 'fail', message: 'Data pembelian tidak ditemukan.' });
        }

        const updatedPayment = await payment.update({
            status,
            payment_status,
            sessions_remaining
        });

        res.status(200).json({ status: 'success', data: { payment: updatedPayment } });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};