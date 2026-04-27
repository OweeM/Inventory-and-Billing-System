const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const Customer = require("../models/Customers");
const Sales = require("../models/Sales");
const { generateInvoiceID } = require("../utils/generateInvoiceID");
const { calculateRewardPoints } = require("../utils/pointCalculator");
const { createNotification } = require("../utils/notificationUtils");

const processCheckout = async (req, res) => {
  try {
    const { memberId, products, totalAmount, paymentMethod, referralId } = req.body;
    if (!memberId || !products || !totalAmount || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const customer = await Customer.findOne({ memberId });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const productsWithDetails = [];
    let calculatedTotal = 0;
    const bulkUpdateOps = [];

    for (const item of products) {
      const product = await Product.findOne({ productId: item.productId });
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      productsWithDetails.push({
        productId: product.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        itemTotal,
      });

      bulkUpdateOps.push({
        updateOne: {
          filter: { productId: product.productId },
          update: { $inc: { quantity: -item.quantity } },
        }
      });
    }

    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ message: "Total amount mismatch", calculatedTotal });
    }

    if (bulkUpdateOps.length > 0) await Product.bulkWrite(bulkUpdateOps);

    const rewardPointsEarned = calculateRewardPoints(totalAmount);

    // Create transaction with retry mechanism for duplicate invoice IDs
    let transaction = new Transaction({
      invoiceId: generateInvoiceID(),
      customerId: customer._id,
      products: productsWithDetails,
      totalAmount: calculatedTotal,
      rewardPointsEarned,
      paymentMethod,
      date: new Date(),
      status: "completed",
    });

    let retries = 3;
    while (retries > 0) {
      try {
        await transaction.save();
        break;
      } catch (error) {
        if (error.code !== 11000) throw error;
        transaction.invoiceId = generateInvoiceID();
        retries--;
      }
    }

    // Create sales records with better error handling
    try {
      const salesRecords = productsWithDetails.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        revenue: item.itemTotal,
        transactionId: transaction._id,
        date: new Date() // Explicitly set the date to match transaction
      }));
      
      await Sales.insertMany(salesRecords);
      console.log(`Created ${salesRecords.length} sales records for transaction ${transaction.invoiceId}`);
    } catch (salesError) {
      console.error("Error creating sales records:", salesError);
      // Continue with the checkout process even if sales records fail
      // but log the error for debugging
    }

    customer.rewardPoints += rewardPointsEarned;
    customer.transactions.push({ transactionId: transaction._id, invoiceId: transaction.invoiceId, amount: calculatedTotal, date: new Date(), pointsEarned: rewardPointsEarned });

    if (referralId && !customer.referredBy) {
      const referrer = await Customer.findOne({ memberId: referralId });
      if (referrer) {
        referrer.rewardPoints += 3;
        await referrer.save();
        customer.rewardPoints += 5;
        customer.referredBy = referralId;
      }
    }

    await customer.save();

    await createNotification(
      "New Transaction",
      `A new transaction has been processed for customer ${customer.name}.`,
      ["Manager", "Cashier"],
      transaction._id,
      null,
      "Medium"
    );

    res.status(201).json({
      message: "Checkout successful",
      transaction,
      customerPoints: customer.rewardPoints,
      rewardPointsEarned
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ... rest of the controller code remains the same ...

// 2. Fetch customer billing history
const getCustomerBillingHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const customer = await Customer.findOne({ memberId: customerId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const transactions = await Transaction.find({ customerId: customer._id })
      .sort({ date: -1 }) // Sort by date descending
      .populate("products.productId", "name price");

    res.status(200).json({
      message: "Billing history retrieved successfully",
      transactions,
      totalPoints: customer.rewardPoints
    });
  } catch (error) {
    console.error("History Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const processRefund = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    if (!transactionId) return res.status(400).json({ message: "Transaction ID is required" });

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.status === "refunded") return res.status(400).json({ message: "Transaction already refunded" });

    const bulkUpdateOps = transaction.products.map(item => ({
      updateOne: {
        filter: { productId: item.productId },
        update: { $inc: { quantity: item.quantity } },
      }
    }));

    if (bulkUpdateOps.length > 0) await Product.bulkWrite(bulkUpdateOps);

    const customer = await Customer.findById(transaction.customerId);
    if (customer) {
      customer.rewardPoints = Math.max(0, customer.rewardPoints - transaction.rewardPointsEarned);
      customer.refunds.push({ transactionId, amount: transaction.totalAmount, date: new Date(), reason });
      await customer.save();
    }

    transaction.status = "refunded";
    transaction.refundDate = new Date();
    transaction.refundReason = reason;
    await transaction.save();

    res.status(200).json({ message: "Refund processed successfully", transaction, customerPoints: customer?.rewardPoints || 0 });
  } catch (error) {
    console.error("Refund Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const getCustomerBillingHistory = async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const customer = await Customer.findOne({ memberId: customerId }).populate("transactions.transactionId");
//     if (!customer) return res.status(404).json({ message: "Customer not found" });
//     res.status(200).json({ message: "Transaction history retrieved", transactions: customer.transactions });
//   } catch (error) {
//     console.error("Billing History Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

module.exports = { processCheckout, processRefund, getCustomerBillingHistory };
