const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
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

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventory-db';

if (!process.env.MONGO_URI) {
  console.warn(
    'WARNING: MONGO_URI is not set. Using fallback local MongoDB URI:',
    mongoUri
  );
}

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 4000;

//  Configure CORS - allow local UI and mobile access from the same network
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//  Middleware Setup
app.use(express.json()); // Body parser

// Serve root-level static files like phone.html
app.get('/phone.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'phone.html'));
});

// also allow /phone as a friendly shortcut
app.get('/phone', (req, res) => {
  res.sendFile(path.join(__dirname, 'phone.html'));
});

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
  .connect(mongoUri, {
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Receive NFC UID from phone
  socket.on("nfc-scan", async (uid) => {
    console.log("📲 NFC UID received:", uid);

    try {
      // OPTIONAL: fetch item from DB
      // const item = await Product.findOne({ nfcId: uid });

      // Send to all frontend clients
      io.emit("update-ui", uid);

    } catch (error) {
      console.error("Error handling NFC scan:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// app.listen(PORT, () => {
//   console.log(` Server is running on http://localhost:${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});