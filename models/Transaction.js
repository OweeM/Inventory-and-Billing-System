const mongoose = require("mongoose");
const Customer = require("./Customers");
const { calculateRewardPoints } = require("../utils/pointCalculator");
const { generateInvoiceID } = require("../utils/generateInvoiceID");

module.exports = { generateInvoiceID };

const transactionSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    required: true,
    default: generateInvoiceID // Use uppercase ID here
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customers",
    required: true,
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
      },
      name: String,
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      itemTotal: Number
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  rewardPointsEarned: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Online"],
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "refunded"],
    default: "completed"
  },
  date: {
    type: Date,
    default: Date.now,
  },
  refundDate: Date,
  refundReason: String
});

transactionSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.rewardPointsEarned = calculateRewardPoints(this.totalAmount);
    await Customer.findByIdAndUpdate(this.customerId, {
      $inc: { rewardPoints: this.rewardPointsEarned },
    });
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
