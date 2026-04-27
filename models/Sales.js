/*
sales- daily,week,month,yr
Product ID,Product Name,Revenue,Total Sales
*/

const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  productId: {
    type: String,  // Changed from ObjectId to String
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  revenue: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: true,
  }
});

module.exports = mongoose.model("Sales", salesSchema);
