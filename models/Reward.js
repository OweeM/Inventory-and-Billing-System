const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    totalPointsDistributed: { type: Number, default: 0 },
    totalPointsRedeemed: { type: Number, default: 0 },
    totalReferrals: { type: Number, default: 0 },
});

module.exports = mongoose.model('Rewards', rewardSchema);