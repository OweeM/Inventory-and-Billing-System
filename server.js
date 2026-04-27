const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Users = require("./models/User"); // Import User Model
const authRoutes = require("./routes/authRoutes"); // Authentication routes
const customerRoutes = require("./routes/customerRoutes");
const billingRoutes = require("./routes/billingRoutes");
const salesRoutes = require("./routes/salesRoutes");
const rewardRoutes = require("./routes/rewardRoutes"); // Rewards routes
const inventoryRoutes = require("./routes/inventoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); // Notification routes
const { createNotification } = require("./utils/notificationUtils"); // Notification utility

// Load environment variables
dotenv.config({ path: './.env' });

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 4000;

//  Configure CORS - change origin to your frontend URL (e.g., localhost:3000)
app.use(
  cors({
    origin: "http://localhost:3000", // adjust according to your frontend
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

//  Middleware Setup
app.use(express.json()); // Body parser

//  API Routes Setup
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/billing", billingRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/rewardproduct", require("./routes/rewardProductRoutes"));
app.use("/api/notifications", notificationRoutes); // Notifications route

//  Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Prevents long timeouts
  })
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Connection Error:", err));

//  Test Route
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});

// Route to trigger system downtime notification
app.post("/api/system-downtime", async (req, res) => {
  try {
    await createNotification(
      "System Downtime",
      "The system is going down for scheduled maintenance.",
      ["Admin", "Manager"],
      null,
      null,
      "High"
    );
    res.status(200).json({ message: "System downtime notification created" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating notification", error: error.message });
  }
});

// Global Error Handler
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  await createNotification(
    "System Alert",
    `A critical error occurred: ${err.message}`,
    ["Admin"],
    null,
    null,
    "High"
  );
  res.status(500).json({ message: "An unexpected error occurred" });
});

app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});