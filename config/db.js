const mongoose = require("mongoose");
const { createNotification } = require("../utils/notificationUtils"); // Import notification utility
require("dotenv").config({ path: "./.env" }); // Load environment variables

const mongoURI = process.env.MONGO_URI;

// Function to connect to MongoDB
const connectToMongoose = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);

    // Successful Connection
    console.log("✅ Connected to MongoDB");

    // Connection Events
    mongoose.connection.on("error", async (err) => {
      console.error("❌ MongoDB connection error:", err);
      await createNotification(
        "Connection Issue",
        `MongoDB connection error: ${err.message}`,
        ["Admin"],
        null,
        null,
        "High"
      );
    });

    mongoose.connection.on("disconnected", async () => {
      console.warn("⚠️ MongoDB disconnected");
      await createNotification(
        "Connection Issue",
        "MongoDB disconnected",
        ["Admin"],
        null,
        null,
        "High"
      );
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    await createNotification(
      "Connection Issue",
      `Failed to connect to MongoDB: ${err.message}`,
      ["Admin"],
      null,
      null,
      "High"
    );
    process.exit(1); // Exit the app on connection failure
  }
};

module.exports = connectToMongoose;