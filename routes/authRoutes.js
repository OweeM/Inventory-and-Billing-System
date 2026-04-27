const express = require("express");
const bcrypt = require("bcrypt");
const Users = require("../models/User"); // Import User model
const router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
  try {
      const users = await Users.find().select("-password");
      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await Users.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: "User not found!" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials!" });
      }

      res.status(200).json({
          message: "Login successful!",
          user: {
              id: user._id,
              username: user.username,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              bio: user.bio
          }
      });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User Registration
router.post("/register", async (req, res) => {
  const { username, password, role, firstName, lastName, bio } = req.body;

  try {
      const existingUser = await Users.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ message: "User already exists!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await Users.create({ username, password: hashedPassword, role, firstName, lastName, bio });

      res.status(201).json({ message: "Registration successful!", user: { id: user._id, username: user.username, role: user.role, firstName: user.firstName, lastName: user.lastName, bio: user.bio } });
  } catch (error) {
      console.error("Registration error:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Change Password
router.put("/change-password", async (req, res) => {
  const { username, newPassword } = req.body;

  try {
      const user = await Users.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: "User not found!" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;