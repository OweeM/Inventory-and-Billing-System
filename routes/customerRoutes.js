const express = require("express");
const {
  getAllCustomers,
  addCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerByMobile, // Existing function for mobile search
  redeemPoints,        // Redeem points function
  addPurchaseHistory,  // Add purchase history function
  checkReferralId      // Check referral ID function
} = require("../controllers/customerController");

const router = express.Router();

// GET all customers (only name, memberId, and rewardPoints)
router.get("/", getAllCustomers);

// Add a new customer
router.post("/", addCustomer);

// Check if referral ID exists
router.get("/check/:id", checkReferralId);

// Get a specific customer using query parameters (e.g., /find?name=John)
router.get("/find", getCustomer);

// Search customer by mobile
router.get("/search", getCustomerByMobile);

// Get a specific customer by ID (placed after /find to avoid conflicts)
router.get("/:id", getCustomer);

// Update customer details by ID
router.put("/:id", updateCustomer);

// Delete a customer using query parameters (e.g., /delete?email=john@example.com)
router.delete("/delete", deleteCustomer);

// Delete a customer by ID
router.delete("/:id", deleteCustomer);

// New routes for customer-specific actions
router.post("/redeem", redeemPoints);              // Redeem points for a customer
router.post("/purchaseHistory", addPurchaseHistory); // Add bill to purchase history

module.exports = router;