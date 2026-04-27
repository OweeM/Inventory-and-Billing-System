const RewardProduct = require("../models/RewardProduct");

// Utility function to generate a random reward product ID
const generateRewardProductId = () => {
  return 'RP' + Math.floor(1000 + Math.random() * 9000); // e.g., RP123456
};

exports.addProduct = async (req, res) => {
  const { name, category, quantity, rewardPoints, description } = req.body;

  try {
    let rewardProductId;
    let isUnique = false;

    // Keep generating a new ID until it's unique
    while (!isUnique) {
      rewardProductId = generateRewardProductId();
      const exists = await RewardProduct.findOne({ rewardProductId });
      if (!exists) {
        isUnique = true;
      }
    }

    // Create the new product with the generated rewardProductId
    const newProduct = new RewardProduct({
      rewardProductId,
      name,
      category,
      quantity,
      rewardPoints,
      description,
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Reward Product added successfully!',
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// Get all reward products
exports.getAllProducts = async (req, res) => {
  try {
    const rewardProducts = await RewardProduct.find();
    res.status(200).json(rewardProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reward product by rewardProductId
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const rewardProduct = await RewardProduct.findOne({ rewardProductId: id });

    if (!rewardProduct) {
      return res.status(404).json({ message: 'Reward Product not found!' });
    }

    res.status(200).json(rewardProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reward products by category
exports.getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const rewardProducts = await RewardProduct.find({ category: category.trim() });
    if (!rewardProducts.length) {
      return res.status(404).json({ message: 'No reward products found in this category!' });
    }

    res.status(200).json({
      message: `Reward Products in category: ${category}`,
      data: rewardProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update reward product by rewardProductId
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, rewardPoints, description } = req.body;

  try {
    const rewardProduct = await RewardProduct.findOne({ rewardProductId: id });
    if (!rewardProduct) {
      return res.status(404).json({ message: 'Reward Product not found!' });
    }

    rewardProduct.name = name || rewardProduct.name;
    rewardProduct.category = category || rewardProduct.category;
    rewardProduct.quantity = quantity || rewardProduct.quantity;
    rewardProduct.rewardPoints = rewardPoints || rewardProduct.rewardPoints;
    rewardProduct.description = description || rewardProduct.description;

    await rewardProduct.save();

    res.status(200).json({
      message: 'Reward Product updated successfully!',
      data: rewardProduct,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete reward product by rewardProductId
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const rewardProduct = await RewardProduct.findOne({ rewardProductId: id });
    if (!rewardProduct) {
      return res.status(404).json({ message: 'Reward Product not found!' });
    }

    await rewardProduct.deleteOne();

    res.status(200).json({ message: 'Reward Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ NEW: Update stock quantities after billing
exports.updateProductStock = async (req, res) => {
  try {
    const { items } = req.body;

    for (const { rewardProductId, quantitySold } of items) {
      const rewardProduct = await RewardProduct.findOne({ rewardProductId });

      if (!rewardProduct) {
        return res.status(404).json({ error: `Reward Product ${rewardProductId} not found` });
      }

      if (rewardProduct.quantity < quantitySold) {
        return res.status(400).json({ error: `Insufficient stock for ${rewardProductId}` });
      }

      rewardProduct.quantity -= quantitySold;
      await rewardProduct.save();
    }

    res.status(200).json({ message: 'Stock updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get low-stock reward products
exports.getLowStockProducts = async (req, res) => {
  const lowStockThreshold = 10;

  try {
    const lowStockRewardProducts = await RewardProduct.find({
      quantity: { $lte: lowStockThreshold },
    });

    res.status(200).json({
      message: `Reward Products with low stock (<= ${lowStockThreshold})`,
      data: lowStockRewardProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Inventory Overview for reward products
exports.getInventoryOverview = async (req, res) => {
  try {
    const totalRewardProducts = await RewardProduct.countDocuments();
    const totalQuantity = await RewardProduct.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);
    const uniqueCategories = await RewardProduct.distinct('category');

    res.status(200).json({
      message: 'Reward Products Inventory Overview',
      data: {
        totalRewardProducts,
        totalQuantity: totalQuantity[0]?.totalQuantity || 0,
        totalCategories: uniqueCategories.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Inventory Stats for reward products
exports.getInventoryStats = async (req, res) => {
  const lowStockThreshold = 10;

  try {
    const averagePrice = await RewardProduct.aggregate([
      { $group: { _id: null, averagePrice: { $avg: '$price' } } },
    ]);
    const totalValue = await RewardProduct.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$price'] } } } },
    ]);
    const lowStockCount = await RewardProduct.countDocuments({
      quantity: { $lte: lowStockThreshold },
    });

    res.status(200).json({
      message: 'Reward Products Inventory Stats',
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
