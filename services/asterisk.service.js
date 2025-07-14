const AsteriskManager = require('asterisk-manager');
const { sequelize, Purchase, Appointment, HistoryCall } = require('../db/models');
const { Op } = require('sequelize');

class AsteriskService {
    constructor() {
        this.ami = new AsteriskManager(
            process.env.ASTERISK_PORT,
            process.env.ASTERISK_HOST,
            process.env.ASTERISK_USER,
            process.env.ASTERISK_SECRET,
            true
        );
        this.ami.keepConnected();
        this.activeCalls = new Map();
        this.listenForEvents();
        console.log('Asterisk Service is running and listening for events.');
    }

    listenForEvents() {
        this.ami.on('managerevent', async (evt) => {
            if (evt.event === 'Cdr') {
                const callId = evt.uniqueid;
                if (this.activeCalls.has(callId)) {
                    console.log(evt);

                    // const { appointmentId, userId, agentId } = this.activeCalls.get(callId);
                    const callDurationSeconds = parseInt(evt.billableseconds, 10);
                    
                    // console.log(`Call for appointment ${appointmentId} ended. Duration: ${callDurationSeconds}s.`);
                    
                    // await this.handleSessionDeduction(purchaseId, appointmentId, callDurationSeconds);
                    // await this.createCallHistory(userId, agentId, callId, callDurationSeconds);

                    this.activeCalls.delete(callId);
                }
            }
        });
    }

    
    async createCallHistory(userId, agentId, uniqueId, durationSeconds) {
        try {
            await HistoryCall.create({
                user_id: userId,
                agent_id: agentId,
                unique_id: uniqueId,
                duration: durationSeconds
            });
            console.log(`Call history created for Uniqueid: ${uniqueId}`);
        } catch (error) {
            console.error('Failed to create call history:', error);
        }
    }

    async handleSessionDeduction(purchaseId, appointmentId, durationSeconds) {
        const t = await sequelize.transaction();
        try {
            const purchase = await Purchase.findByPk(purchaseId, { transaction: t });
            const appointment = await Appointment.findByPk(appointmentId, { transaction: t });

            if (!purchase || !appointment) {
                throw new Error('Purchase or Appointment not found for session deduction.');
            }

            const minutesConsumed = Math.ceil(durationSeconds / 60);
            const newSessionsRemaining = purchase.sessions_remaining - minutesConsumed;
            
            purchase.sessions_remaining = Math.max(0, newSessionsRemaining);

            await purchase.save({ transaction: t });
            await appointment.save({ transaction: t });
            
            await t.commit();
            console.log(`Successfully deducted ${minutesConsumed} minute(s) from purchase ${purchaseId}.`);

        } catch (error) {
            await t.rollback();
            console.error('Failed to handle session deduction:', error);
        }
    }

    /**
     * Memulai panggilan antara user dan listener
     * @param {string} sipUser - Nomor telepon user
     * @param {string} sipAgent - Nomor telepon listener
    //  * @param {string} purchaseId - ID pembelian yang digunakan
     */
    originateCall(sipUser, sipAgent, userName) {
         return new Promise((resolve, reject) => {
            console.log('Originate Call:', sipUser, sipAgent);
            if (!sipUser || !sipAgent) {
                return reject(new Error('Alamat SIP user dan agent tidak boleh kosong.'));
            }

            const customCallId = crypto.randomUUID();

            const action = {
                'Action': 'Originate',
                'Channel': `PJSIP/${sipAgent}@RanaITC`,
                // 'Channel': `PJSIP/7262003@RanaITC`,
                'Application': 'Dial',
                'Data': `PJSIP/${sipUser}`,
                // 'Data': `PJSIP/1072601`,
                'Async': 'true',
                'CallerId': `${userName}`,
                'ActionId': `${customCallId}`
            };

            const responseListener = (evt) => {
                if(evt.event === 'OriginateResponse'){
                    if (evt.response === 'Success') {
                        const uniqueId = evt.uniqueid; 
                         
                        this.activeCalls.set(uniqueId, { 
                            // purchaseId: purchaseId,
                            // userId: appointment.user_id,
                            // agentId: appointment.agent_id
                        });
                        console.log(`Call successfully initiated. Tracking with Uniqueid: ${uniqueId}`);
                        resolve({ success: true, message: 'Call initiated.', uniqueid: uniqueId });
                    } else {
                        console.error(`Failed to initiate call: ${evt}`);
                        reject(new Error(`Gagal memulai panggilan. Pesan dari Asterisk: ${evt.response}`));
                    }
                    
                }
            };

            this.ami.on('managerevent', responseListener);
            
            this.ami.action(action, (err, res) => {
                if (err) {
                    this.ami.removeListener('managerevent', responseListener);
                    return reject(err);
                }
            });
        });
    }

    getAvailableSips() {
        
    }
}

module.exports = new AsteriskService();