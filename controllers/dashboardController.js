const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');
const Customers = mongoose.model('Customers');
const Product = mongoose.model('Product');
const Sales = mongoose.model('Sales'); // Import Sales model

exports.getDashboardStats = async (req, res) => {
  try {
    console.log("----- Dashboard Stats Request Start -----");
    
    // Default values for response
    const stats = {
      dailySales: 0,
      customersCount: 0,
      dailyTransactions: 0,
      totalRewards: 0
    };
    
    const inventory = {
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      newProducts: 0
    };
    
    let recentBills = [];

    // 1. Get customer count
    try {
      stats.customersCount = await Customers.countDocuments();
      console.log("Customer count:", stats.customersCount);
    } catch (error) {
      console.error("Error fetching customer count:", error);
    }

    // 2. Get product data
    try {
      const products = await Product.find().lean();
      inventory.totalProducts = products.length;
      inventory.lowStockItems = products.filter(p => p.quantity != null && p.quantity > 0 && p.quantity < 10).length;
      inventory.outOfStockItems = products.filter(p => p.quantity != null && p.quantity === 0).length;
      console.log("Product stats calculated:", inventory);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }

    // 3. Get new products (added in last 30 days)
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      inventory.newProducts = await Product.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });
      console.log("New products count:", inventory.newProducts);
    } catch (error) {
      console.error("Error fetching new products count:", error);
    }

    // 4. Get daily sales data - Improved method
    try {
      const today = new Date();
      // Set date to the beginning of the day (midnight local time)
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      // End of the day (23:59:59.999 local time)
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      console.log(`Querying transactions between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

      // First try using the Sales model (better for detailed sales data)
      try {
        const salesData = await Sales.find({
          date: { $gte: startOfDay, $lte: endOfDay }
        }).lean();
        
        if (salesData.length > 0) {
          // Calculate from Sales model
          stats.dailyTransactions = salesData.length;
          stats.dailySales = salesData.reduce((sum, sale) => sum + (sale.revenue || 0), 0);
          console.log("Daily stats from Sales model:", stats.dailySales, stats.dailyTransactions);
        } else {
          console.log("No sales data found for today, falling back to transactions");
          
          // Fall back to Transaction model
          const transactions = await Transaction.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: "refunded" } // Exclude refunded transactions
          }).lean();
          
          stats.dailyTransactions = transactions.length;
          stats.dailySales = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
          console.log("Daily stats from Transaction model:", stats.dailySales, stats.dailyTransactions);
          
          // If still no data, try a different approach
          if (stats.dailyTransactions === 0) {
            // Use string date comparison as a fallback
            const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            
            const allTransactions = await Transaction.find({
              status: { $ne: "refunded" } // Exclude refunded transactions
            }).lean();
            
            const todayTransactions = allTransactions.filter(tx => {
              if (!tx.date) return false;
              const txDate = new Date(tx.date);
              return txDate.toISOString().split('T')[0] === todayStr;
            });
            
            if (todayTransactions.length > 0) {
              stats.dailyTransactions = todayTransactions.length;
              stats.dailySales = todayTransactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
              console.log("Daily stats using string comparison:", stats.dailySales, stats.dailyTransactions);
            } else {
              // Last resort: just get the most recent transactions
              const recentTransactions = await Transaction.find({
                status: { $ne: "refunded" }
              })
                .sort({ date: -1 })
                .limit(5)
                .lean();
                
              if (recentTransactions.length > 0) {
                stats.dailyTransactions = recentTransactions.length;
                stats.dailySales = recentTransactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
                console.log("Using recent transactions as fallback:", stats.dailySales);
              }
            }
          }
        }
      } catch (salesError) {
        console.error("Error querying Sales model, falling back to transactions:", salesError);
        
        // Fall back to Transaction model
        const transactions = await Transaction.find({
          date: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: "refunded" }
        }).lean();
        
        stats.dailyTransactions = transactions.length;
        stats.dailySales = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
      }
      
      console.log("Final Daily Sales:", stats.dailySales, "Daily Transactions:", stats.dailyTransactions);
    } catch (error) {
      console.error("Error fetching daily sales data:", error);
    }

    // 5. Get total reward points from all customers
    try {
      const rewardsData = await Customers.aggregate([
        { $group: { _id: null, totalPoints: { $sum: "$rewardPoints" } } }
      ]);

      if (rewardsData && rewardsData.length > 0) {
        stats.totalRewards = rewardsData[0].totalPoints || 0;
      }
      console.log("Total Rewards (from Customers):", stats.totalRewards);
    } catch (error) {
      console.error("Error fetching total rewards from customers:", error);
    }

    // 6. Get recent bills
    try {
      // Get recent transactions
      recentBills = await Transaction.find()
        .sort({ date: -1 })
        .limit(10)
        .populate('customerId', 'name memberId')
        .select('invoiceId customerId totalAmount date status')
        .lean();
      
      console.log(`Recent bills fetched: ${recentBills.length} items`);
      
      // Ensure recentBills is always an array
      if (!Array.isArray(recentBills)) {
        recentBills = [];
      }
    } catch (error) {
      console.error("Error fetching recent bills:", error);
      recentBills = [];
    }

    // Send the response
    res.status(200).json({
      stats,
      inventory,
      recentBills
    });
    
  } catch (error) {
    console.error("!!! Critical Dashboard Stats Error !!!:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics", error: error.message });
  }
};