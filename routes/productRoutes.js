const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/productController');

// Add a new product
router.post('/add', inventoryController.addProduct);

// Get all products
router.get('/', inventoryController.getAllProducts);

// Get product by ID (productId-based)
router.get('/:id', inventoryController.getProductById);

// Get products by category
router.get('/category/:category', inventoryController.getProductsByCategory);

// Update a product by productId
router.put('/:id', inventoryController.updateProduct);

// Delete a product by productId
router.delete('/:id', inventoryController.deleteProduct);

// Get low-stock products
router.get('/low-stock', inventoryController.getLowStockProducts);

// Get inventory overview
router.get('/overview', inventoryController.getInventoryOverview);

// Get inventory stats
router.get('/stats', inventoryController.getInventoryStats);

// ✅ NEW: Update stock quantities after billing
router.post('/update-stock', inventoryController.updateProductStock);

module.exports = router;
