const { sequelize, Appointment, Sip, AvailableSlot, Purchase, Package, Agent, User, Notification } = require('../db/models');
const { Op, where } = require('sequelize');
const asteriskService = require('../services/asterisk.service');


exports.sendSip = async (req, res) => {
    try {
        const sip = await Sip.findOne();
        console.log('Sip found:', sip);
        res.status(200).json({
            status: 'success',
            data: {
                sip
            }
        });
    } catch (error) {
        console.error('Error fetching SIP:', error);
        res.status(500).json({ status: 'error', message: 'Gagal memulai panggilan.' });
    }
}


exports.startCall = async (req, res) => {
    try {
        const { sip } = req.body;
        const user = req.user;

        const agent = await Agent.findOne({ where: {status: 'available'}  });

        // const activePurchase = await Purchase.findOne({
        //     where: {
        //         user_id: user.id,
        //         status: 'active',
        //         sessions_remaining: { [Op.gt]: 0 }
        //     }
        // });

        // if (!activePurchase) {
        //     return res.status(400).json({ status: 'fail', message: 'Anda tidak memiliki sisa sesi yang cukup untuk melakukan panggilan.' });
        // }

        await asteriskService.originateCall(
            sip,
            agent.sip,
            user.name
            // activePurchase.id
        );

        res.status(200).json({
            status: 'success',
            message: 'Panggilan sedang dimulai...'
        });

    } catch (error) {
        console.error('Error starting call:', error);
        res.status(500).json({ status: 'error', message: 'Gagal memulai panggilan.' });
    }
};