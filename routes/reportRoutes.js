const express = require("express");
const {
  getSalesReport,
  getCustomerReport,
} = require("../controllers/reportController"); // Import controller functions

const router = express.Router();

// Define the routes
router.get("/sales", getSalesReport); // Route for fetching sales report
router.get("/customers", getCustomerReport); // Route for fetching customer report

module.exports = router; // Export the router