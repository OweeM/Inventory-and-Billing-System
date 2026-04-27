const Notification = require("../models/Notification");

const createNotification = async (type, message, recipientRole, linkedTransactionId = null, linkedProductId = null, priority = "Medium") => {
  try {
    const notification = new Notification({
      type,
      message,
      recipientRole,
      linkedTransactionId,
      linkedProductId,
      priority,
    });
    await notification.save();
    console.log(`Notification created: ${type} - ${message}`);
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

module.exports = { createNotification };