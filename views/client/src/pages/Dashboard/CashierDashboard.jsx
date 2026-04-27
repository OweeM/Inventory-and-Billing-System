import React, { useState, useEffect } from "react";
import axios from "axios";
import StatsCard from "../../components/StatsCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CashierDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      dailySales: 0,
      customersCount: 0,
      dailyTransactions: 0,
      totalRewards: 0
    },
    recentBills: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [salesDataLoading, setSalesDataLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Fetching cashier dashboard data...");
        const response = await axios.get(`http://localhost:4000/api/dashboard/stats?filter=today`);
        console.log("Dashboard data received:", response.data);
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard data error:", err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchDailySalesData = async () => {
      try {
        setSalesDataLoading(true);
        console.log("Fetching cashier sales data...");
        const response = await axios.get(`http://localhost:4000/api/sales/daily?filter=today`);
        console.log("Daily sales data received:", response.data);

        const formattedData = response.data?.sales?.map(item => ({
          name: item.productName.length > 12 ? item.productName.substring(0, 12) + "..." : item.productName,
          revenue: item.totalRevenue
        })) || [];

        setDailySalesData(formattedData);
      } catch (err) {
        console.error("Daily sales data error:", err);
        setDailySalesData([]);
      } finally {
        setSalesDataLoading(false);
      }
    };

    fetchDashboardData();
    fetchDailySalesData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-bold">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-bold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-800">Cashier Dashboard</h1>
        </div>

        {/* Stats Section - reduced gap and margin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <StatsCard
            title="Daily Sales"
            value={`₹${dashboardData.stats.dailySales.toFixed(2)}`}
          />
          <StatsCard 
            title="Customers Served" 
            value={dashboardData.stats.customersCount}
          />
          <StatsCard 
            title="Transactions" 
            value={dashboardData.stats.dailyTransactions}
          />
          <StatsCard 
            title="Rewards" 
            value={dashboardData.stats.totalRewards}
          />
        </div>

        {/* Sales Chart - reducing height */}
        <div className="bg-white p-3 rounded-md shadow mb-3">
          <h2 className="text-md font-bold text-gray-700 mb-2 text-center">Sales Revenue by Product</h2>
          <div className="flex justify-center items-center h-56">
            {salesDataLoading ? (
              <div className="text-gray-500 flex items-center justify-center h-full">
                Loading sales data...
              </div>
            ) : dailySalesData.length === 0 ? (
              <div className="text-gray-500 flex items-center justify-center h-full">
                No sales data available
              </div>
            ) : (
              <div className="w-full h-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailySalesData}
                    margin={{ top: 10, right: 20, left: 40, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 12, fontWeight: 'bold', fill: '#333' }}
                      tickMargin={10}
                      stroke="#666"
                    />
                    <YAxis
                      label={{
                        value: 'Revenue (₹)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 14, fontWeight: 'bold', fill: '#333' },
                        offset: -25
                      }}
                      tickFormatter={(value) => `₹${value}`}
                      padding={{ top: 10 }}
                      tickCount={5}
                      tick={{ fontSize: 12, fontWeight: 'bold', fill: '#333' }}
                      stroke="#666"
                    />
                    <Tooltip
                      formatter={(value) => [`₹${value}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '14px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                      }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      wrapperStyle={{ fontSize: '17px', fontWeight: 'bold' }}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a2fad2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ADEFD1" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="revenue"
                      fill="url(#colorRevenue)"
                      name="Revenue"
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      radius={[8, 8, 0, 0]} // Rounded top corners
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bills Table - fixed height with internal scroll - reducing height */}
        <div className="bg-white p-3 rounded-md shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-bold text-gray-700">Recent Bills Processed</h2>
            <span className="text-xs text-gray-500">
              {dashboardData.recentBills?.length || 0} bills found
            </span>
          </div>
          
          {dashboardData.recentBills && dashboardData.recentBills.length > 0 ? (
            <div className="overflow-x-auto" style={{ maxHeight: "160px" }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentBills.map((bill) => (
                    <tr key={bill._id || bill.invoiceId}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900">{bill.invoiceId || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {bill.customerId ? bill.customerId.name : "Walk-in Customer"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bill.customerId ? bill.customerId.memberId : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">₹{bill.totalAmount?.toFixed(2) || '0.00'}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bill.status === "completed" ? "bg-green-100 text-green-800" : 
                          bill.status === "refunded" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-red-100 text-red-800"
                        }`}>
                          {bill.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500 text-sm">
              {loading ? "Loading bills..." : "No recent bills found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierDashboardPage;