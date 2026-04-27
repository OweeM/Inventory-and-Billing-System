// const express = require("express");
// const {
//   addProduct,
//   getAllProducts,
//   getProductByDetails,
//   deleteProductByDetails,
//   updateProduct,
//   getProductsByCategory,
// } = require("../controllers/productController");


// const router = express.Router();

// // Routes
// router.post("/post", addProduct); // Add a product
// router.get("/getall", getAllProducts); // Get all products
// router.get("/getdetails", getProductByDetails); // Get product by productId and name
// router.delete("/delete", deleteProductByDetails); // Delete product by productId and name
// router.put("/updateproductId", updateProduct); // Update quantity and price by productId
// router.get("/getallbycategory", getProductsByCategory); // Get products by category

// module.exports = router;

const express = require("express");
const {
  addProduct,
  getAllProducts,
  getProductByDetails,
  deleteProductByDetails,
  updateProduct,
  getProductsByCategory,
  getInventoryStats, // <-- add this here
} = require("../controllers/inventoryController");

const router = express.Router();

// Routes
router.post("/post", addProduct); // Add a product
router.get("/getall", getAllProducts); // Get all products
router.get("/getdetails", getProductByDetails); // Get product by productId and name
router.delete("/delete", deleteProductByDetails); // Delete product by productId and name
router.put("/updateproductId", updateProduct); // Update quantity and price by productId
router.get("/getallbycategory", getProductsByCategory); // Get products by category

// New endpoint for inventory statistics
router.get("/inventoryStats", getInventoryStats);

module.exports = router;
