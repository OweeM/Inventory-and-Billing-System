const Product = require('../models/Product');

// Add a new product
exports.addProduct = async (req, res) => {
  const { name, productId, category, quantity, price, description } = req.body;

  try {
    const newProduct = new Product({
      name,
      productId, // Ensure productId is stored
      category,
      quantity,
      price,
      description,
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Product added successfully!',
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get product by productId
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ productId: id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const products = await Product.find({ category: category.trim() });
    if (!products.length) {
      return res.status(404).json({ message: 'No products found in this category!' });
    }

    res.status(200).json({
      message: `Products in category: ${category}`,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product by productId
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, price, description } = req.body;

  try {
    const product = await Product.findOne({ productId: id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.quantity = quantity || product.quantity;
    product.price = price || product.price;
    product.description = description || product.description;

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully!',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product by productId
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ productId: id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
    }

    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ NEW: Update stock quantities after billing
exports.updateProductStock = async (req, res) => {
  try {
    const { items } = req.body;

    for (const { productId, quantitySold } of items) {
      const product = await Product.findOne({ productId });

      if (!product) {
        return res.status(404).json({ error: `Product ${productId} not found` });
      }

      if (product.quantity < quantitySold) {
        return res.status(400).json({ error: `Insufficient stock for ${productId}` });
      }

      product.quantity -= quantitySold;
      await product.save();
    }

    res.status(200).json({ message: 'Stock updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get low-stock products
exports.getLowStockProducts = async (req, res) => {
  const lowStockThreshold = 10;

  try {
    const lowStockProducts = await Product.find({
      quantity: { $lte: lowStockThreshold },
    });

    res.status(200).json({
      message: `Products with low stock (<= ${lowStockThreshold})`,
      data: lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Inventory Overview
exports.getInventoryOverview = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalQuantity = await Product.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);
    const uniqueCategories = await Product.distinct('category');

    res.status(200).json({
      message: 'Inventory Overview',
      data: {
        totalProducts,
        totalQuantity: totalQuantity[0]?.totalQuantity || 0,
        totalCategories: uniqueCategories.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Inventory Stats
exports.getInventoryStats = async (req, res) => {
  const lowStockThreshold = 10;

  try {
    const averagePrice = await Product.aggregate([
      { $group: { _id: null, averagePrice: { $avg: '$price' } } },
    ]);
    const totalValue = await Product.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$price'] } } } },
    ]);
    const lowStockCount = await Product.countDocuments({
      quantity: { $lte: lowStockThreshold },
    });

    res.status(200).json({
      message: 'Inventory Stats',
      data: {
        averagePrice: averagePrice[0]?.averagePrice || 0,
        totalInventoryValue: totalValue[0]?.totalValue || 0,
        lowStockCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
