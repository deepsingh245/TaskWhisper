const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await User.getProfile(userId);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const updatedProfile = await User.updateProfile(userId, updates);
        res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
        next(error);
    }
};
