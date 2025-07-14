const { AvailableSlot, Agent } = require('../db/models');

exports.createSlot = async (req, res) => {
  try {
    const newSlot = await AvailableSlot.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { slot: newSlot }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getAllSlots = async (req, res) => {
  try {
    const slots = await AvailableSlot.findAll({
      include: {
        model: Agent,
        as: 'agent',
        attributes: ['id', 'name']
      },
      order: [['start_time', 'ASC']]
    });
    res.status(200).json({
      status: 'success',
      results: slots.length,
      data: { slots }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getSlotById = async (req, res) => {
  try {
    const slot = await AvailableSlot.findByPk(req.params.id, {
      include: { model: Agent, as: 'agent' }
    });
    if (!slot) {
      return res.status(404).json({ status: 'fail', message: 'Slot tidak ditemukan.' });
    }
    res.status(200).json({
      status: 'success',
      data: { slot }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// UPDATE: Mengubah data slot (hanya admin)
exports.updateSlot = async (req, res) => {
  try {
    const slot = await AvailableSlot.findByPk(req.params.id);
    if (!slot) {
      return res.status(404).json({ status: 'fail', message: 'Slot tidak ditemukan.' });
    }
    const updatedSlot = await slot.update(req.body);
    res.status(200).json({
      status: 'success',
      data: { slot: updatedSlot }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// DELETE: Menghapus slot (hanya admin)
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await AvailableSlot.findByPk(req.params.id);
    if (!slot) {
      return res.status(404).json({ status: 'fail', message: 'Slot tidak ditemukan.' });
    }
    await slot.destroy();
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
