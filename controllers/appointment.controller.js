const { sequelize, Appointment, Payment, Subscription, Schedule, CallResponse, Package, Agent, User, Notification } = require('../db/models');
const { Op } = require('sequelize');
const asteriskService = require('../services/asterisk.service');

exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            where : {
                user_id: req.user.id,
                status: 'scheduled'
            },
            include: [
                {model: Schedule, as : 'schedule'},
                {model: CallResponse, as : 'call_response'}
            ]
        });

        res.status(200).json({
            status: 'success',
            message: 'Successfully fetch appointment',
            data: { appointment }
        });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}


exports.createAppointment = async (req, res) => {
    const { schedule_id } = req.body;
    if (!schedule_id) {
        return res.status(400).json({ status: 'fail', message: 'ID schedule can not be empty.' });
    }
    const t = await sequelize.transaction();

    try {
        const user = req.user;

        const activeSubscription = await Subscription.findOne({
            where: {
                user_id: user.id,
                status: 'active',
                sessions_remaining: { [Op.gt]: 0 }
            },
            include: [{ model: Package, as: 'package', attributes: ['access_level'] }],
            transaction: t
        });

        if (!activeSubscription) {
            await t.rollback();
            return res.status(400).json({ status: 'fail', message: 'You don\'t have an active subscription.' });
        }

        const chosenSchedule = await Schedule.findByPk(schedule_id, { transaction: t });
    
        if (!chosenSchedule) {
            await t.rollback();
            return res.status(404).json({ status: 'fail', message: 'The selected schedule was not found.' });
        }

        if (chosenSchedule.is_booked) {
            await t.rollback();
            return res.status(409).json({ status: 'fail', message: 'This schedule is already booked. Please choose another slot.' });
        }

        if (activeSubscription.package.access_level < chosenSchedule.slot_access_level) {
            await t.rollback();
            return res.status(403).json({ status: 'fail', message: 'Your package level is not sufficient to book this slot.' });
        }

        const newAppointment = await Appointment.create({
            user_id: user.id,
            agent_id: '7262003',
            slot_id: chosenSchedule.id,
            appointment_time: chosenSchedule.start_time,
            status: 'scheduled'
        }, { transaction: t });

        await chosenSchedule.update({ is_booked: true }, { transaction: t });
        
        const remaining = activeSubscription.sessions_remaining - 1;
        await activeSubscription.update({ 
            sessions_remaining: remaining,
            ...(remaining === 0 && { status: 'completed' })
        }, { transaction: t });

        await Notification.create({
            user_id: user.id,
            title: 'Appointment Created',
            message: `Your appointment has been successfully scheduled for ${chosenSchedule.start_time}.`
        }, { transaction: t });
        
        await t.commit();

        res.status(201).json({
            status: 'success',
            message: 'Appointment created successfully.',
            data: { appointment: newAppointment }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.canStartCall = async (req, res) => {
    try {
        const {appointmentId} = req.body;

    } catch (error) {
        
    }
}

exports.startCall = async (req, res) => {
    try {
        const { id: appointmentId } = req.params;
        const user = req.user;

        const appointment = await Appointment.findOne({
            where: { id: appointmentId, user_id: user.id },
            include: [
                { model: User, as: 'user', attributes: ['sip_user'] },
                { model: Agent, as: 'agent', attributes: ['sip_user'] }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ status: 'fail', message: 'Appointment tidak ditemukan atau Anda tidak berhak mengaksesnya.' });
        }

        if (appointment.status !== 'scheduled') {
            return res.status(400).json({ status: 'fail', message: `Tidak dapat memulai panggilan untuk appointment yang statusnya ${appointment.status}.` });
        }


        await asteriskService.originateCall(
            appointment,
            appointment.user.sip_user,
            appointment.agent.sip_user,
            activePayment.id
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