const express = require("express");
const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const router = express.Router();

// Create a new notification
router.post("/", createNotification);

// Get all notifications with pagination
router.get("/", getNotifications);

// Mark notification as read
router.put("/:id", markAsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

module.exports = router;