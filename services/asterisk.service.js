const AsteriskManager = require('asterisk-manager');
const { sequelize, Subscription, Agent, Sip, Appointment, HistoryCall } = require('../db/models');
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
            const uniqueId = evt.uniqueid || evt.actionid;

            if (!uniqueId || !this.activeCalls.has(uniqueId)) return;

            const { user, agentId, sipUser } = this.activeCalls.get(uniqueId);

            if (evt.event === 'Cdr') {
                console.log(evt);

                const callDurationSeconds = parseInt(evt.billableseconds, 10) || 0;

                await this.handleSessionDeduction(user, callDurationSeconds);
                await this.updateStatusAgent(agentId, sipUser, 'available');

                this.activeCalls.delete(uniqueId);
            }

        
        });
    }

    async updateStatusAgent(agentId, sipUser, status) {
        const t = await sequelize.transaction();
        try {
            const agent = await Agent.findByPk(agentId, { transaction: t });
            const sip = await Sip.findOne({where: {sip: sipUser}}, { transaction: t });

            if (!agent || !sip) {
                throw new Error('Agent or Sip not found for status update.');
            }

            agent.status = status;
            sip.status = status;
            await agent.save();
            await sip.save();

            await t.commit();
            console.log(`Agent ${agent.id} status updated to 'busy'`);
        } catch (error) {
            await t.rollback();
            console.error('Failed to update agent status:', error);
        }
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

    async handleSessionDeduction(user, durationSeconds) {
        const t = await sequelize.transaction();
        try {
            console.log(user.subscription);
            const subscription = await Subscription.findByPk(user.subscription.id, { transaction: t });

            if (!subscription) {
                throw new Error('Subscription not found for session deduction.');
            }

            const minutesConsumed = Math.ceil(durationSeconds / 60);
            const newSessionsRemaining = subscription.duration_remaining - minutesConsumed;

            subscription.duration_remaining = Math.max(0, newSessionsRemaining);

            await subscription.save();
            await t.commit();
            console.log(`Successfully deducted ${minutesConsumed} minute(s) from payment ${subscription.id}.`);

        } catch (error) {
            await t.rollback();
            console.error('Failed to handle session deduction:', error);
        }
    }

    

    /**
     * Memulai panggilan antara user dan listener
     * @param {string} sipUser - Nomor telepon user
     * @param {array} user - Nomor telepon listener
     * @param {array} agent - Nama user yang digunakan
     *
     */
    originateCall(sipUser, user, agent) {
         return new Promise((resolve, reject) => {
            const customCallId = crypto.randomUUID();

            const action = {
                'Action': 'Originate',
                'Channel': `PJSIP/${agent.sip}@RanaITC`,
                // 'Channel': `PJSIP/1726203@RanaITC`,

                'Application': 'Dial',
                'Data': `PJSIP/${sipUser}`,
                'Async': 'true',
                'CallerId': `${user.name} IT`,
                'ActionId': `${customCallId}`
            };

            const responseListener = async (evt) => {
                if (evt.event === 'OriginateResponse') {
                    if (evt.response === 'Success') {
                        const uniqueId = evt.uniqueid; 
                 
                        this.activeCalls.set(uniqueId, { 
                            user,
                            agentId: agent.id,
                            sipUser
                        });

                        console.log(`Call successfully initiated. Tracking with Uniqueid: ${uniqueId}`);
                        resolve({ success: true, message: 'Call initiated.', uniqueid: uniqueId });
                    } else {
                        console.error(`Failed to initiate call: ${JSON.stringify(evt)}`);

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