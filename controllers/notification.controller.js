const { Notification } = require('../db/models');

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        user_id: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({
        status: 'fail',
        message: 'Notifikasi tidak ditemukan.'
      });
    }

    // Update status is_read menjadi true
    notification.is_read = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
