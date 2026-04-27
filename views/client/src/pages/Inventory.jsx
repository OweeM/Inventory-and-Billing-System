import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar"; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InventoryPage = () => {
  // useNavigate hook for navigation
  const navigate = useNavigate();

  // Navigation function from inventory to product page
  const navigateToProduct = () => {
    navigate('/product');
  };

  // State variables for inventory statistics
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  // Fetch inventory stats on component mount
  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/inventory/inventoryStats");
      if (response.data.success) {
        setTotalProducts(response.data.totalProducts);
        setLowStockProducts(response.data.lowStockProducts);
        setChartData(response.data.stockTrends);
      }
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
    }
  };

  // Data for the chart using real-time data from backend
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Total stock value',
        data: chartData.data,
        borderColor: 'rgba(0, 123, 255, 1)',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  // Reuse the same section styling as before
  const sectionStyle = {
    backgroundColor: '#F0F2F5',
    borderColor: '#DBE0E5',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div
      className="min-h-screen bg-white-200 pb-12"
      style={{ fontFamily: 'Montserrat', width: '1000px', margin: '0 auto', overflow: 'hidden', paddingLeft: '20px' }}
    >
      <Navbar />

      <div className="pt-10 pr-8">
        {/* Total Products Section */}
        <div
          className="p-4 mb-6 border"
          style={{ ...sectionStyle, width: '100%' }}
        >
          <h2 className="text-lg font-bold mb-2">Total Products</h2>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>

        {/* Low-Stock Warnings Section */}
        <div 
          className="p-6 mb-6 border"
          style={{ borderColor: '#DBE0E5',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '100%' }}
        >
          <h2 className="text-lg font-bold mb-4">Low-stock warnings</h2>
          <div className="grid grid-cols-2 gap-4">
            {lowStockProducts.map((item, index) => (
              <div
                key={index}
                className="p-4 border flex justify-between items-center"
                style={{ ...sectionStyle }}
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">{item.quantity} in stock</p>
                </div>
                <button
                  className="px-4 py-2 rounded-lg border"
                  style={{ borderColor: '#DBE0E5', backgroundColor: '#E8EBEF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                  onClick={navigateToProduct}
                >
                  Add stock
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Trends and Quick Links Section */}
        <div className="flex gap-6">
          {/* Stock Trends Section */}
          <div
            className="border py-10"
            style={{
              ...sectionStyle,
              height: '320px',
              width: '50%',
            }}
          >
            <h2 className="text-lg font-bold mb-4 px-6">Stock trends over time</h2>
            <div className="px-6">
              <Line data={data} options={options} />
            </div>
          </div>

          {/* Quick Links Section (unchanged UI) */}
          <div
            className="border p-6"
            style={{
              ...sectionStyle,
              height: '320px',
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <h2 className="text-lg font-bold">Quick Links</h2>
            <button
              className="bg-white px-4 py-4 rounded-lg border"
              style={{ borderColor: '#DBE0E5', backgroundColor: '#E8EBEF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
              onClick={navigateToProduct}
            >
              + Add a product
            </button>
            <button
              className="bg-white px-4 py-4 rounded-lg border"
              style={{ borderColor: '#DBE0E5', backgroundColor: '#E8EBEF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
              onClick={navigateToProduct}
            >
              Manage products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;