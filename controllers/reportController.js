const Notification = require("../models/Notification");
const Customer = require("../models/Customer");
const Transaction = require("../models/Transaction");

// Helper to add notifications
const addNotification = async (type, message, roles) => {
  try {
    await Notification.create({
      type,
      message,
      recipientRole: roles,
    });
    console.log(`Notification added: ${type} - ${message}`);
  } catch (error) {
    console.error("Error adding notification:", error.message);
  }
};

// Sales Report
const getSalesReport = async (req, res) => {
  try {
    console.log("Fetching sales report...");

    const salesData = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalSales: { $sum: "$totalAmount" },
          totalTransactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort results by date in ascending order
    ]);

    console.log("Sales Data Aggregation Result:", salesData);

    await addNotification(
      "Report Accessed",
      "Sales report has been accessed.",
      ["Manager", "Admin"]
    );

    res.status(200).json(salesData);
  } catch (error) {
    console.error("Error generating sales report:", error.message);
    res.status(500).json({
      message: "Error generating sales report",
      error: error.message,
    });
  }
};

// Customer Report
const getCustomerReport = async (req, res) => {
  try {
    console.log("Fetching customer report...");

    const customerData = await Customer.aggregate([
      {
        $project: {
          name: 1,
          rewardPoints: 1,
          purchaseCount: { $size: "$purchases" },
        },
      },
      { $sort: { purchaseCount: -1 } }, // Sort results by purchase count
    ]);

    console.log("Customer Data Aggregation Result:", customerData);

    await addNotification(
      "Report Accessed",
      "Customer report has been accessed.",
      ["Manager", "Admin"]
    );

    res.status(200).json(customerData);
  } catch (error) {
    console.error("Error generating customer report:", error.message);
    res.status(500).json({
      message: "Error generating customer report",
      error: error.message,
    });
  }
};

module.exports = { getSalesReport, getCustomerReport };

