const { sequelize, Appointment, AvailableSlot, Purchase, Package, Agent, User, Notification } = require('../db/models');
const { Op } = require('sequelize');
const asteriskService = require('../services/asterisk.service');


exports.createAppointment = async (req, res) => {
    const { slot_id } = req.body;
    if (!slot_id) {
        return res.status(400).json({ status: 'fail', message: 'ID Slot harus disertakan dalam permintaan.' });
    }

  const t = await sequelize.transaction();

  try {
    const user = req.user;

    const activePurchase = await Purchase.findOne({
      where: {
        user_id: user.id,
        status: 'active',
        sessions_remaining: { [Op.gt]: 0 }
      },
      include: { model: Package, as: 'package' },
      transaction: t
    });

    if (!activePurchase) {
      await t.rollback();
      return res.status(400).json({ status: 'fail', message: 'Anda tidak memiliki paket sesi yang aktif atau sisa sesi Anda telah habis.' });
    }

    const userAccessLevel = activePurchase.package.access_level;
    const chosenSlot = await AvailableSlot.findByPk(slot_id, { transaction: t });
    
   
    // 3. Lakukan serangkaian validasi pada slot yang dipilih
    if (!chosenSlot) {
        await t.rollback();
        return res.status(404).json({ status: 'fail', message: 'Slot yang dipilih tidak ditemukan.' });
    }
    if (chosenSlot.is_booked) {
        await t.rollback();
        return res.status(409).json({ status: 'fail', message: 'Slot ini sudah dipesan. Silakan pilih slot lain.' });
    }
    if (userAccessLevel < chosenSlot.slot_access_level) {
        await t.rollback();
        return res.status(403).json({ status: 'fail', message: 'Level paket Anda tidak mencukupi untuk memesan slot ini.' });
    }

    // 4. Buat Appointment, update slot, dan kurangi sesi
    const newAppointment = await Appointment.create({
        user_id: user.id,
        agent_id: chosenSlot.agent_id, // Listener ditentukan oleh slot
        slot_id: chosenSlot.id,
        appointment_time: chosenSlot.start_time,
        status: 'scheduled'
    }, { transaction: t });

    await chosenSlot.update({ is_booked: true }, { transaction: t });
    
    const remaining = activePurchase.sessions_remaining - 1;
    await activePurchase.update({ sessions_remaining: remaining }, { transaction: t });
    
    if (remaining === 0) {
        await activePurchase.update({ status: 'completed' }, { transaction: t });
    }

    // Jika semua berhasil, commit transaksi
    await t.commit();

    res.status(201).json({
        status: 'success',
        message: 'Janji temu berhasil dibuat.',
        data: { appointment: newAppointment }
    });
  } catch (error) {
    await t.rollback(); // Jika ada error, batalkan semua
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.startCall = async (req, res) => {
    try {
        const { id: appointmentId } = req.params;
        const user = req.user;

        // 1. Validasi appointment
        const appointment = await Appointment.findOne({
            where: { id: appointmentId, user_id: user.id },
            include: [
                { model: User, as: 'user', attributes: ['sip_user'] },
                { model: Agent, as: 'agent', attributes: ['sip_user'] } // Asumsi agent juga punya sip_user
            ]
        });

        if (!appointment) {
            return res.status(404).json({ status: 'fail', message: 'Appointment tidak ditemukan atau Anda tidak berhak mengaksesnya.' });
        }
        if (appointment.status !== 'scheduled') {
            return res.status(400).json({ status: 'fail', message: `Tidak dapat memulai panggilan untuk appointment yang statusnya ${appointment.status}.` });
        }

        // 2. Cek paket aktif user
        const activePurchase = await Purchase.findOne({
            where: {
                user_id: user.id,
                status: 'active',
                sessions_remaining: { [Op.gt]: 0 }
            }
        });

        if (!activePurchase) {
            return res.status(400).json({ status: 'fail', message: 'Anda tidak memiliki sisa sesi yang cukup untuk melakukan panggilan.' });
        }

        // 3. Panggil service Asterisk untuk memulai panggilan
        await asteriskService.originateCall(
            appointment,
            appointment.user.sip_user,
            appointment.agent.sip_user,
            activePurchase.id
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