// const express = require("express");
// const router = express.Router();
// const billingController = require("../controllers/billingController");
// // const { validateCheckoutRequest } = require("../middlewares/validateRequest");

// // Route for processing checkout
// router.post(
//   "/checkout",
//   // validateCheckoutRequest, // Validation middleware
//   billingController.processCheckout
// );

// // Route for fetching transaction history
// router.get("/history/:customerId", billingController.getCustomerBillingHistory);

// // Route for processing refunds
// router.post("/refund/:transactionId", billingController.processRefund);

// module.exports = router;

const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");

// Debugging line to check if the functions are properly imported
console.log("Billing Controller:", billingController);

// Define routes
router.post("/checkout", billingController.processCheckout);
router.patch("/refund/:transactionId", billingController.processRefund);
router.get("/history/:customerId", billingController.getCustomerBillingHistory);

module.exports = router;
