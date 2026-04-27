const mongoose = require("mongoose");

// Custom function to generate a random product ID
const generateProductId = () => {
  return `PROD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: generateProductId,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
