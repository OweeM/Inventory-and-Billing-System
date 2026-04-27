const Customer = require("../models/Customers");

// Generate a unique Member ID
const generateMemberId = () => {
  return `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Get all customers (now returns full customer information)
const getAllCustomers = async (req, res) => {
  console.log("getAllCustomers triggered"); // Debug log
  try {
    // Fetch all customers with complete information
    const customers = await Customer.find({});
    console.log("Retrieved customers:", customers.length); // Debug log
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
};

// ✅ Add a new customer with referral processing
const addCustomer = async (req, res) => {
  try {
    const { name, phone, email, referralId, customerType, purchaseHistory } = req.body;
    console.log("Creating customer with data:", { name, phone, email, referralId, customerType, purchaseHistory });
    // Check for duplicate phone number
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer with this phone already exists" });
    }
    // Determine final customer type
    let finalCustomerType = referralId ? "Referral" : (customerType || "Fresh");
    // Create customer with default values
    const newCustomer = new Customer({
      memberId: generateMemberId(),
      name,
      phone,
      email,
      referralId: referralId || null,
      customerType: finalCustomerType,
      rewardPoints: 0,
      referrals: [],
      purchaseHistory: purchaseHistory || [],
    });
    // Process referral rewards if referralId exists
    if (referralId) {
      const referrer = await Customer.findOne({ memberId: referralId });
      if (referrer) {
        console.log(`Found referrer: ${referrer.name} (${referrer.memberId})`);
        if (!referrer.referrals) {
          referrer.referrals = [];
        }
        referrer.referrals.push(newCustomer.memberId);
        referrer.rewardPoints = (referrer.rewardPoints || 0) + 10;
        await referrer.save();
        newCustomer.rewardPoints = 5;
        console.log("Added 10 points to referrer and 5 points to new customer");
      } else {
        console.log(`Referrer with ID ${referralId} not found`);
        newCustomer.referralId = null;
        newCustomer.customerType = "Fresh";
      }
    }
    const savedCustomer = await newCustomer.save();
    console.log(`Customer saved with ID: ${savedCustomer._id} and memberId: ${savedCustomer.memberId}`);
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ message: "Error adding customer", error: error.message });
  }
};

// ✅ Check if a referral ID exists
const checkReferralId = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findOne({ memberId: id });
    res.status(200).json({ exists: !!customer });
  } catch (error) {
    res.status(500).json({ message: "Error checking referral ID", error: error.message });
  }
};

// ✅ Get a specific customer by ID, name, phone, or email
const getCustomer = async (req, res) => {
  try {
    const { id, name, phone, email } = req.query;
    let query = {};
    if (id) {
      query.$or = [{ _id: id }, { memberId: id }];
    }
    if (name) query.name = name;
    if (phone) query.phone = phone;
    if (email) query.email = email;
    const customer = await Customer.findOne(query);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

// ✅ Get customer by mobile number
const getCustomerByMobile = async (req, res) => {
  try {
    const { mobile } = req.query;
    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
    }
    const customer = await Customer.findOne({ phone: mobile });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update customer details by ID
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error });
  }
};

// ✅ Delete a customer by ID, name, phone, or email
const deleteCustomer = async (req, res) => {
  try {
    const { id, name, phone, email } = req.query;
    const deletedCustomer = await Customer.findOneAndDelete({
      ...(id && { _id: id }),
      ...(name && { name }),
      ...(phone && { phone }),
      ...(email && { email }),
    });
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
};

// 🔄 Redeem Points – Remove customer's reward points.
const redeemPoints = async (req, res) => {
  try {
    const { memberId, pointsRedeemed, discount } = req.body;
    const customer = await Customer.findOne({ memberId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    if (customer.rewardPoints < pointsRedeemed) {
      return res.status(400).json({ 
        message: "Insufficient reward points",
        currentPoints: customer.rewardPoints,
        requestedPoints: pointsRedeemed
      });
    }
    customer.rewardPoints -= pointsRedeemed;
    customer.purchaseHistory.push({
      date: new Date(),
      items: [{ productId: "POINTS-REDEMPTION", quantity: 1, price: 0 }],
      totalAmount: 0,
      rewardPointsEarned: -pointsRedeemed,
      redemptionNotes: `Redeemed ${pointsRedeemed} points for a discount of Rs. ${discount}`
    });
    await customer.save();
    res.status(200).json({
      message: "Points redeemed successfully",
      remainingPoints: customer.rewardPoints,
      customer
    });
  } catch (error) {
    res.status(500).json({
      message: "Error redeeming points",
      error: error.message,
    });
  }
};

const addPurchaseHistory = async (req, res) => {
  try {
    console.log("🔔 Add purchase history endpoint hit", req.body);
    const { memberId, items, totalAmount, rewardPointsEarned, invoiceId, date, paymentMode } = req.body;
    const customer = await Customer.findOne({ memberId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    customer.purchaseHistory.push({
      invoiceId,
      date: date || Date.now(),
      items,
      totalAmount,
      rewardPointsEarned,
      paymentMode
    });
    const pointsToAdd = rewardPointsEarned || Math.floor(totalAmount / 20) * 5;
    customer.rewardPoints += pointsToAdd;
    console.log(`Adding ${pointsToAdd} reward points to customer. New total: ${customer.rewardPoints}`);
    await customer.save();
    const updatedCustomer = await Customer.findOne({ memberId });
    console.log("🔍 Updated purchase history:", updatedCustomer.purchaseHistory);
    console.log("💰 Updated reward points:", updatedCustomer.rewardPoints);
    res.status(200).json({ 
      message: "Purchase history and reward points updated successfully", 
      customer: updatedCustomer,
      pointsAdded: pointsToAdd 
    });
  } catch (error) {
    console.error("💥 Error:", error);
    res.status(500).json({ message: "Error updating purchase history", error: error.message });
  }
};

module.exports = {
  getAllCustomers,
  addCustomer,
  checkReferralId,
  getCustomer,
  getCustomerByMobile,
  updateCustomer,
  deleteCustomer,
  redeemPoints,
  addPurchaseHistory,
};