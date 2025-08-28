const {Subscription, User, Package} = require("../db/models");

exports.getProfile = async (req, res) => {
    console.log('Fetching user profile for:', req.user.id);
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'phone_number', 'is_verified'],
            include: {
                model: Subscription,
                as : 'subscription',
                include : {
                    model: Package,
                    as :'package'
                }
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};
