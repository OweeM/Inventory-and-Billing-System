// const Product = require("../models/Product");

// // Add a new product
// exports.addProduct = async (req, res) => {
//   try {
//     const product = new Product(req.body);
//     await product.save();
//     res.status(201).json({ success: true, data: product });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Update quantity and price of a product
// exports.updateProduct = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { quantity, price } = req.body;
//     const updatedProduct = await Product.findOneAndUpdate(
//       { productId },
//       { quantity, price },
//       { new: true }
//     );
//     if (!updatedProduct) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }
//     res.status(200).json({ success: true, data: updatedProduct });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get a single product by productId and name
// exports.getProductByDetails = async (req, res) => {
//   try {
//     const { productId, name } = req.query;
//     const product = await Product.findOne({ productId, name });
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }
//     res.status(200).json({ success: true, data: product });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete a product by productId and name
// exports.deleteProductByDetails = async (req, res) => {
//   try {
//     const { productId, name } = req.query;
//     const deletedProduct = await Product.findOneAndDelete({ productId, name });
//     if (!deletedProduct) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }
//     res.status(200).json({ success: true, message: "Product deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get all products
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get products by category (new function)
// exports.getProductsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;
//     const products = await Product.find({ category });
//     if (products.length === 0) {
//       return res.status(404).json({ success: false, message: "No products found in this category" });
//     }
//     res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const Product = require("../models/Product");
const { createNotification } = require("../utils/notificationUtils");

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update quantity and price of a product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, price } = req.body;
    const updatedProduct = await Product.findOneAndUpdate(
      { productId },
      { quantity, price },
      { new: true }
    );
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Create a low stock notification if quantity is below threshold
    if (quantity < 10) {
      await createNotification(
        "Low Stock Alert",
        `Stock for product ${updatedProduct.name} is low.`,
        ["Manager"],
        null,
        updatedProduct._id,
        "High"
      );
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single product by productId and name
exports.getProductByDetails = async (req, res) => {
  try {
    const { productId, name } = req.query;
    const product = await Product.findOne({ productId, name });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product by productId and name
exports.deleteProductByDetails = async (req, res) => {
  try {
    const { productId, name } = req.query;
    const deletedProduct = await Product.findOneAndDelete({ productId, name });
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get products by category (new function)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found in this category" });
    }
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// New function: Get inventory statistics for the dashboard
exports.getInventoryStats = async (req, res) => {
  try {
    // Calculate total products by summing the quantity of all products
    const totalAgg = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ]);
    const totalProducts = totalAgg[0] ? totalAgg[0].total : 0;

    // Get 4 products with the lowest quantity for low-stock warnings
    const lowStockProducts = await Product.find().sort({ quantity: 1 }).limit(4);

    // Aggregate stock trends data by month (using updatedAt) and sum quantities
    const stockTrendsAgg = await Product.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%b %Y", date: "$updatedAt" } },
          total: { $sum: "$quantity" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format the aggregation result for the chart
    const labels = stockTrendsAgg.map(item => item._id);
    const dataPoints = stockTrendsAgg.map(item => item.total);

    res.status(200).json({
      success: true,
      totalProducts,
      lowStockProducts,
      stockTrends: {
        labels,
        data: dataPoints
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
