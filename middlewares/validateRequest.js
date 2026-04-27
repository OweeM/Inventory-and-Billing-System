// const { body, validationResult } = require("express-validator");

// const validateCheckoutRequest = [
//   body("customerId")
//     .matches(/^CUST-\d{13}-\d{3}$/)
//     .withMessage("Invalid Customer ID format"),
//   body("products")
//     .isArray({ min: 1 })
//     .withMessage("Products are required"),
//   body("products.*.productId")
//     .matches(/^PROD-[A-Z0-9]{10}$/)
//     .withMessage("Invalid product ID format"),
//   body("products.*.quantity")
//     .isInt({ min: 1 })
//     .withMessage("Invalid product quantity"),
//   body("totalAmount").isNumeric().withMessage("Total amount must be a number"),
//   body("paymentMethod")
//     .isIn(["Cash", "Online"])
//     .withMessage("Invalid payment method"),
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   },
// ];

// module.exports = { validateCheckoutRequest };
