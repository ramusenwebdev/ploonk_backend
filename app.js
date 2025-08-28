const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');
const notificationRouter = require('./routes/notification.routes');
const packageRouter = require('./routes/package.routes'); 
const paymentRouter = require('./routes/payment.routes');
const agentRouter = require('./routes/agent.routes');
const scheduleRouter = require('./routes/schedule.routes');
const appointmentRouter = require('./routes/appointment.routes');
const historyCallRouter = require('./routes/history_call.routes');
const asteriskRouter = require('./routes/asterisk.routes');
const callResponseRouter = require('./routes/call_response.routes');
const app = express();

app.use(cors());
app.use(express.json());

// Rute utama untuk pengecekan status API
app.get('/', (req, res) => {
  res.send('API Backend Berjalan!');
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/packages', packageRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/agents', agentRouter);
app.use('/api/v1/schedules', scheduleRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/history-calls', historyCallRouter);
app.use('/api/v1/asterisk', asteriskRouter);
app.use('/api/v1/call-responses', callResponseRouter);

app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Rute ${req.originalUrl} tidak ditemukan di server ini.`,
  });
});

module.exports = app;
