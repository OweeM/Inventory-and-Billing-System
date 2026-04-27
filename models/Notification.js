const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "Report Accessed",
      "Low Stock Alert",
      "Payment Issue",
      "New Transaction",
      "System Alert",
      "Connection Issue",
      "System Downtime",
    ],
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Unread", "Read"],
    default: "Unread",
  },
  recipientRole: {
    type: [String],
    required: true,
    enum: ["Manager", "Cashier", "Admin"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  linkedTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    default: null,
  },
  linkedProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);