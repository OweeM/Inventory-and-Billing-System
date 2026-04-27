const Notification = require("../models/Notification");

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating notification",
      error: error.message,
    });
  }
};

// Get all notifications with pagination
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, recipientRole } = req.query;
    const query = {};
    if (type) query.type = type;
    if (recipientRole) query.recipientRole = recipientRole;

    const notifications = await Notification.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: "Read" },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(400).json({
      message: "Error updating notification",
      error: error.message,
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
};