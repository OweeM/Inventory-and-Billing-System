const Sales = require("../models/Sales");
const Customers = require("../models/Customers"); // Corrected model name
const Product = require("../models/Product");

const getDateRange = (range, customDate = null) => {
  const date = customDate ? new Date(customDate) : new Date();
  date.setHours(0, 0, 0, 0);

  switch(range) {
    case 'daily':
      return { 
        start: new Date(date),
        end: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case 'weekly':
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      };
    case 'monthly':
      return {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    default:
      return { start: date, end: date };
  }
};

const getSalesReport = async (req, res) => {
  const { range } = req.params;
  const { date } = req.query;

  // Validate range parameter
  if (!['daily', 'weekly', 'monthly'].includes(range)) {
    return res.status(400).json({ 
      message: 'Invalid time range specified. Use daily, weekly, or monthly.'
    });
  }

  try {
    const { start, end } = getDateRange(range, date);

    // 1. Get sales records for the period
    const sales = await Sales.find({
      date: { $gte: start, $lte: end }
    }).lean();

    // 2. Get customer purchases for the period
    const customers = await Customers.find({ 
      "purchaseHistory.date": { $gte: start, $lte: end }
    }).lean();

    // 3. Collect all unique product IDs from both sources
    const productIds = new Set();
    
    // Add product IDs from sales
    sales.forEach(sale => {
      if (sale.productId) productIds.add(sale.productId.toString());
    });

    // Add product IDs from customer purchases
    customers.forEach(customer => {
      customer.purchaseHistory.forEach(purchase => {
        if (Array.isArray(purchase.items)) {
          purchase.items.forEach(item => {
            if (item.productId) productIds.add(item.productId.toString());
          });
        }
      });
    });

    // 4. Get product details in a single query
    const products = await Product.find({
      productId: { $in: Array.from(productIds) } 
    }).lean();

    // Create a product name mapping
    const productNameMap = {};
    products.forEach(product => {
      productNameMap[product.productId] = product.name;
    });

    // 5. Process all sales data
    const allSales = sales.map(sale => ({
      productId: sale.productId,
      productName: productNameMap[sale.productId] || sale.productName || 'Unknown Product', 
      quantity: sale.quantity || 0,
      revenue: sale.revenue || 0,
      date: sale.date,
      source: 'direct_sale'
    }));

    // 6. Process all customer purchases
    const allPurchases = customers.flatMap(customer => 
      customer.purchaseHistory.flatMap(purchase => {
        if (!Array.isArray(purchase.items)) return []; 
        return purchase.items.map(item => ({
          productId: item.productId,
          productName: productNameMap[item.productId] || item.name || 'Unknown Product', 
          quantity: item.quantity || 0,
          revenue: (item.price || 0) * (item.quantity || 0),
          date: purchase.date,
          source: 'customer_purchase'
        }));
      })
    );

    // 7. Combine all transactions
    const allTransactions = [...allSales, ...allPurchases];

    // 8. Aggregate data by product
    const productMap = new Map();
    
    allTransactions.forEach(transaction => {
      if (transaction.productId == null) return; 

      const productIdStr = transaction.productId.toString();

      if (!productMap.has(productIdStr)) {
        productMap.set(productIdStr, {
          productId: transaction.productId,
          productName: transaction.productName,
          totalQuantity: 0,
          totalRevenue: 0,
          sources: new Set()
        });
      }
      
      const productData = productMap.get(productIdStr);
      productData.totalQuantity += transaction.quantity;
      productData.totalRevenue += transaction.revenue;
      productData.sources.add(transaction.source);
    });

    // 9. Convert to array and sort by revenue (descending)
    const reportData = Array.from(productMap.values())
      .map(product => ({
        ...product,
        sources: Array.from(product.sources)
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // 10. Send response
    res.status(200).json({
      success: true,
      message: `${range} sales report generated successfully`,
      range,
      date: date ? new Date(date).toISOString().split('T')[0] : 'Current',
      sales: reportData,
      totalProductsSold: reportData.length,
      totalTransactionsProcessed: allTransactions.length,
      customersInPeriod: customers.length,
      timeRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sales Report Error (${range}):`, {
      message: error.message,
      stack: error.stack,
      queryDate: date
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message,
      range,
      queryDate: date
    });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const monthlySales = await Sales.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalRevenue: { $sum: "$revenue" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json({
      success: true,
      sales: monthlySales
    });
  } catch (error) {
    console.error('Error generating monthly sales data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve monthly sales data',
      error: error.message
    });
  }
};

module.exports = {
  getSalesReport,
  getMonthlySales
};