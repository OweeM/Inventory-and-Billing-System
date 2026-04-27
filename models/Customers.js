const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    customerType: {
      type: String,
      required: true,
      enum: ['Fresh', 'Referral'],
      default: 'Fresh'
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    referralId: {
      type: String,
      default: null,
    },
    referrals: [String], // Array of member IDs referred by this customer
    purchaseHistory: [
      {
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transaction",
        },
        date: {
          type: Date,
          default: Date.now,
        },
        items: [
          {
            productId: {
              type: String,
              required: true,
            },
            quantity: Number,
            price: Number,
          },
        ],
        totalAmount: Number,
        rewardPointsEarned: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customers", customerSchema);
