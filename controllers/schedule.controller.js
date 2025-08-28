const { where } = require('sequelize');
const { Schedule, Agent, Appointment, sequelize } = require('../db/models');
const { Op, fn, col, literal } = require('sequelize');

exports.getAllSchedules = async (req, res) => {
  try {
    const yearInt = parseInt(req.query.year, 10);
    const monthInt = parseInt(req.query.month, 10);

    const schedules = await Schedule.findAll({
        where: {
          [Op.and]: [
         where(fn('EXTRACT', literal(`YEAR FROM "schedule_time"`)), yearInt),
            where(fn('EXTRACT', literal(`MONTH FROM "schedule_time"`)), monthInt),
        ],
        is_booked: false},
    });
    res.status(200).json({
      status: 'success',
      data: { schedules }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {schedule_id, call_response_id } = req.body;

        const agent = await Agent.findOne({where : {status: 'available'} });
        const schedule = await Schedule.findByPk(schedule_id);
        const appointment = await Appointment.create({
            user_id : req.user.id,
            agent_id : agent.id,
            schedule_id : schedule.id,
            response_type_id : call_response_id,
            status : 'scheduled'
        });
        await schedule.update({
            is_booked: true
        })
        await appointment.save();
        await t.commit();

        res.status(200).json({ status: 'success', message: 'Successfully created a appointment' });

    } catch (error) {
        await t.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                status: 'error',
                message: 'Schedule already created',
            });
        }

        res.status(500).json({ status: 'error', message: error.message });
    }
}