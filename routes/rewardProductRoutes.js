const express = require("express");
const router = express.Router();
const rewardProductController = require('../controllers/rewardProductController');  // Import the correct controller

// Add a new reward product
router.post('/add', rewardProductController.addProduct);

// Get all reward products
router.get('/', rewardProductController.getAllProducts);

// Get reward product by ID (rewardProductId-based)
router.get('/:id', rewardProductController.getProductById);

// Get reward products by category
router.get('/category/:category', rewardProductController.getProductsByCategory);

// Update a reward product by rewardProductId
router.put('/:id', rewardProductController.updateProduct);

// Delete a reward product by rewardProductId
router.delete('/:id', rewardProductController.deleteProduct);

// Get low-stock reward products
router.get('/low-stock', rewardProductController.getLowStockProducts);

// Get reward products inventory overview
router.get('/overview', rewardProductController.getInventoryOverview);

// Get reward products inventory stats
router.get('/stats', rewardProductController.getInventoryStats);

// ✅ NEW: Update stock quantities for reward products after billing
router.post('/update-stock', rewardProductController.updateProductStock);

module.exports = router;
