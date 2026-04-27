// models/RewardProduct.js
const mongoose = require('mongoose');

const rewardProductSchema = new mongoose.Schema({
  rewardProductId: {
    type: String,
    unique: true,
    required: true,
  },
  name: String,
  category: String,
  quantity: Number,
  rewardPoints: Number,
  description: String,
});

module.exports = mongoose.model('RewardProduct', rewardProductSchema);
