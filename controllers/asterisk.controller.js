const { sequelize, Sip, Subscription, Agent, } = require('../db/models');
const { Op, where } = require('sequelize');
const asteriskService = require('../services/asterisk.service');


exports.sendSip = async (req, res) => {
    try {
        const sip = await Sip.findOne();
        
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
    const t = await sequelize.transaction();
    try {
        const { sip } = req.body;
        
        const sipUser =await Sip.findOne({ where: { sip }, transaction: t });


        const agent = await Agent.findOne({ where: { status: 'available' }, transaction: t });

        try {
        await asteriskService.originateCall(sip, req.user, agent);
        } catch (asteriskError) {
            console.error('Asterisk error:', asteriskError.message);

            // Rollback transaksi
            await t.rollback();
            const failedAgent = await Agent.findByPk(agent.id);
            console.log('Fetched after rollback:', failedAgent?.status);

            if (failedAgent) {
                failedAgent.status = 'error';
                await failedAgent.save();
                console.log('Agent status updated to error');
            } else {
                console.log('Agent not found after rollback');
            }
            return res.status(500).json({
                status: 'error',
                message: 'Gagal memulai panggilan',
            });
        }

        agent.status = 'busy';
        sipUser.status = 'busy';

        await sipUser.save({ transaction: t });
        await agent.save({ transaction: t });
        await t.commit();
        res.status(200).json({
            status: 'success',
            message: 'Panggilan sedang dimulai...'
        });
    } catch (error) {
            // Cegah rollback dobel
        if (!t.finished) {
        await t.rollback();
        }
        res.status(500).json({ status: 'error', message: 'Gagal memulai panggilan.' });
    }
};

exports.startCallAppointment = async (req, res) => {
    
} 