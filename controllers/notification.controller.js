const { Notification, sequelize } = require('../db/models');

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        user_id: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });
    console.log(notifications);
    res.status(200).json({
      status: 'success',
      data: {
        notifications
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const notification = await Notification.findOne({
        where: {
            id: id,
            user_id: req.user.id 
        }
        });

        if (!notification) {
            return res.status(404).json({
                status: 'fail',
                message: 'Notifikasi tidak ditemukan.'
            });
        }

        notification.is_read = true;
        
        await notification.save();
        await t.commit();

        res.status(201).json({
            status: 'success',
            message : 'Successfully updated a notification'
        });
    } catch (error) {
        await t.rollback();
        console.error(error.message);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};


exports.markAsReadAll = async (req, res) => {
    const t = await sequelize.transaction();

  try {
        const updated = await Notification.update(
        { is_read: true },
        {
            where: {
            user_id: req.user.id,
            is_read: false,
            },
            transaction: t,
        }
        );

        await t.commit();
        res.status(200).json({
            status: 'success',
            message: 'Semua notifikasi telah ditandai sebagai telah dibaca.',
        });
    } catch (error) {
        await t.rollback();

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};