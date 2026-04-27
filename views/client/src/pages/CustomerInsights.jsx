import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

function CustomerInsights() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerTypeData, setCustomerTypeData] = useState({
    labels: ['Referral', 'Fresh'],
    datasets: [{
      label: 'Customer Types',
      data: [0, 0],
      backgroundColor: ['#FF6384', '#36A2EB'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB'],
    }]
  });

  // Monthly sales data state with empty initial values
  const [monthlySalesData, setMonthlySalesData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Monthly Sales (₹)',
        data: [],
        fill: false,
        borderColor: '#4F7A94',
        tension: 0.1
      }
    ]
  });

  useEffect(() => {
    fetchCustomers();
    fetchMonthlySales();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Get all customers with detailed info
      const response = await axios.get('http://localhost:4000/api/customers');
      
      // Get detailed information for each customer
      const detailedCustomersPromises = response.data.map(async (basicCustomer) => {
        try {
          const detailResponse = await axios.get(`http://localhost:4000/api/customers/find?id=${basicCustomer.memberId}`);
          return detailResponse.data;
        } catch (error) {
          console.error(`Error fetching details for customer ${basicCustomer.name}:`, error);
          return basicCustomer;
        }
      });
      
      const detailedCustomers = await Promise.all(detailedCustomersPromises);
      setCustomers(detailedCustomers);

      // Calculate customer type ratio from the detailed data
      const referralCount = detailedCustomers.filter(customer => customer.customerType === 'Referral').length;
      const freshCount = detailedCustomers.filter(customer => 
        !customer.customerType || customer.customerType === 'Fresh'
      ).length;

      setCustomerTypeData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: [referralCount, freshCount]
        }]
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  // Update monthly sales data style
  const fetchMonthlySales = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/sales/monthly');
      const salesData = response.data.sales;

      if (salesData && salesData.length > 0) {
        // Process the data for chart display
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Sort data chronologically by year and month
        salesData.sort((a, b) => {
          if (a._id.year !== b._id.year) {
            return a._id.year - b._id.year;
          }
          return a._id.month - b._id.month;
        });

        // Create formatted labels and data arrays
        const labels = salesData.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`);
        const data = salesData.map(item => item.totalRevenue);

        // Update chart data with enhanced styling
        setMonthlySalesData({
          labels,
          datasets: [
            {
              label: 'Monthly Sales (₹)',
              data,
              fill: true,
              borderWidth: 4,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
              pointBackgroundColor: '#50586C',
              pointBorderColor: '#DCE2F0',
              pointHoverBackgroundColor: '#DCE2F0',
              pointHoverBorderColor: '#50586C',
              pointRadius: 8,
              pointHoverRadius: 10,
              pointBorderWidth: 3,
              pointHoverBorderWidth: 3
            }
          ]
        });
      } else {
        // Set default data if no sales data is available
        setMonthlySalesData({
          labels: ['No Data Available'],
          datasets: [
            {
              label: 'Monthly Sales (₹)',
              data: [0],
              fill: true,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              tension: 0.3
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching monthly sales data:', error);
      // Set fallback data on error
      setMonthlySalesData({
        labels: ['Error Loading Data'],
        datasets: [
          {
            label: 'Monthly Sales (₹)',
            data: [0],
            fill: true,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            tension: 0.3
          }
        ]
      });
    }
  };

  // Update customer type colors to be more vibrant
  useEffect(() => {
    setCustomerTypeData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        backgroundColor: ['#FF5722', '#2196F3'],
        hoverBackgroundColor: ['#FF9800', '#03A9F4'],
        borderWidth: 2,
        borderColor: ['#FFF', '#FFF']
      }]
    }));
  }, []);

  // Calculate total purchase amount for a customer
  const calculateTotalPurchase = (purchaseHistory) => {
    if (!purchaseHistory || purchaseHistory.length === 0) return 0;
    return purchaseHistory.reduce((total, purchase) => total + (purchase.totalAmount || 0), 0).toFixed(2);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <div className="p-6 bg-gray-100 flex-1 ml-0" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          <button
            onClick={() => navigate("/customerlist")}
            style={{ backgroundColor: '#4F7A94', fontFamily: 'Montserrat, sans-serif' }}
            className="text-white px-4 py-2 rounded-lg hover:opacity-80 transition duration-300 mb-4"
          >
            Back to Customer List
          </button>

          {/* Customer Insights Table */}
          <div className="overflow-y-auto" style={{ maxHeight: '75vh' }}>
            <table className="table-auto w-full bg-white shadow-md rounded-lg mb-6">
              <thead>
                <tr className="bg-gray-200" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <th className="px-4 py-2 text-center">Customer Name</th>
                  <th className="px-4 py-2 text-center">Customer Type</th>
                  <th className="px-4 py-2 text-center">Total Purchase Amount</th>
                  <th className="px-4 py-2 text-center">Points</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">Loading customer data...</td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer._id || customer.memberId} className="border-t">
                      <td className="px-4 py-2 text-center">{customer.name || '—'}</td>
                      <td className="px-4 py-2 text-center">{customer.customerType || 'Fresh'}</td>
                      <td className="px-4 py-2 text-center">₹{calculateTotalPurchase(customer.purchaseHistory)}</td>
                      <td className="px-4 py-2 text-center">{customer.rewardPoints || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">No customer data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className="flex justify-center mt-6 mb-14">
            <div className="w-1/2 mr-4">
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Monthly Sales
              </h3>
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center p-4 shadow-lg">
                <Line 
                  data={monthlySalesData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(200, 200, 200, 0.3)'
                        },
                        ticks: {
                          callback: function(value) {
                            return '₹' + value;
                          },
                          font: {
                            size: 16,
                            weight: 'bold'
                          },
                          color: '#333'
                        },
                        title: {
                          display: true,
                          text: 'Revenue (₹)',
                          font: {
                            size: 18,
                            weight: 'bold'
                          },
                          color: '#333'
                        }
                      },
                      x: {
                        grid: {
                          color: 'rgba(200, 200, 200, 0.3)'
                        },
                        ticks: {
                          font: {
                            size: 16,
                            weight: 'bold'
                          },
                          color: '#333'
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        titleFont: {
                          size: 18
                        },
                        bodyFont: {
                          size: 16
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        callbacks: {
                          label: function(context) {
                            return '₹' + context.raw.toLocaleString();
                          }
                        },
                        padding: 12,
                        cornerRadius: 8
                      },
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: 18,
                            weight: 'bold'
                          },
                          usePointStyle: true,
                          padding: 20,
                          color: '#333'
                        }
                      }
                    },
                    animation: {
                      duration: 2000,
                      easing: 'easeOutQuart'
                    }
                  }}
                />
              </div>
            </div>
            <div className="w-1/2 ml-4">
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Customer Types Ratio
              </h3>
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center p-4 shadow-lg">
                <Doughnut 
                  data={customerTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        titleFont: {
                          size: 18
                        },
                        bodyFont: {
                          size: 16
                        },
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                          }
                        },
                        padding: 12,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        cornerRadius: 8
                      },
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: 18,
                            weight: 'bold'
                          },
                          padding: 20,
                          color: '#333'
                        }
                      }
                    },
                    cutout: '65%',
                    animation: {
                      animateRotate: true,
                      animateScale: true,
                      duration: 2000,
                      easing: 'easeOutBounce'
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerInsights;