import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { DatePicker } from "antd";
import dayjs from 'dayjs';
import "antd/dist/reset.css";
import html2pdf from 'html2pdf.js';

const SalesReport = () => {
  // State declarations
  const [timeRange, setTimeRange] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchSalesData();
  }, [timeRange, selectedDate]);

  const fetchSalesData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = `http://localhost:4000/api/sales/${timeRange}?date=${selectedDate.format('YYYY-MM-DD')}`;
      const response = await axios.get(endpoint);
      
      if (!response.data?.sales) {
        throw new Error("No sales data received");
      }

      // Process and sort data by revenue (descending)
      const processedData = response.data.sales.map(item => {
        let productId;
        if (item._id && typeof item._id === 'object') {
          productId = item._id.productId || JSON.stringify(item._id);
        } else {
          productId = item._id || item.productId || 'N/A';
        }

        return {
          id: productId,
          name: item.productName || 'Unknown Product',
          quantity: item.totalQuantity || 0,
          revenue: item.totalRevenue || 0
        };
      }).sort((a, b) => b.revenue - a.revenue);

      setTableData(processedData);

    } catch (error) {
      console.error("Fetch error:", error);
      setError({
        message: "Failed to load sales data",
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range.toLowerCase());
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(dayjs());
    }
  };

  const handleDownload = () => {
    const reportTitle = `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Sales Report - ${selectedDate.format('YYYY-MM-DD')}`;
    
    // PDF export options
    const options = {
      margin: 1,
      filename: `${reportTitle.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    // Create a clone of the report element to modify for PDF
    const element = reportRef.current.cloneNode(true);
    
    // Add a title to the PDF
    const title = document.createElement('div');
    title.innerHTML = `<h1 style="text-align: center; font-size: 18px; margin-bottom: 20px;">${reportTitle}</h1>`;
    element.prepend(title);
    
    // Add company info at top
    const companyInfo = document.createElement('div');
    companyInfo.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 16px; margin-bottom: 5px;">Kalpana Industries</h2>
        
        <p style="font-size: 12px; margin: 0;">Phone: (123) 456-7890 | Email: contact@example.com</p>
      </div>
    `;
    element.prepend(companyInfo);
    
    // Add footer with date and page number
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="text-align: center; margin-top: 20px; font-size: 10px;">
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    `;
    element.appendChild(footer);
    
    // Generate and download the PDF
    html2pdf().set(options).from(element).save();
  };

  // Calculate totals for the summary section
  const totalQuantity = tableData.reduce((sum, row) => sum + row.quantity, 0);
  const totalRevenue = tableData.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <div className="font-notosans p-5 ml-12">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error.message}
          {error.details && <p className="mt-1 text-sm">{error.details}</p>}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
          <p className="mt-2">Loading sales data...</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          {["Daily", "Weekly", "Monthly"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTimeRangeChange(tab)}
              className={`px-4 py-2 rounded-md ${
                timeRange === tab.toLowerCase() 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          className="border rounded px-3 py-2"
          format="YYYY-MM-DD"
        />

        <button 
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Export Report
        </button>
      </div>

      <div ref={reportRef} className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Sales
          </h3>
          <p className="text-sm text-gray-500">
            {selectedDate.format('MMMM D, YYYY')} | {tableData.length} products
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.length > 0 ? (
                tableData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{row.name}</div>
                      <div className="text-sm text-gray-500">{row.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{row.revenue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No sales data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">{totalQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">₹{totalRevenue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;