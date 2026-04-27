import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // First get the basic customer list which only has name, memberId, rewardPoints
      const response = await axios.get("http://localhost:4000/api/customers");
      
      // Get full details for each customer
      const detailedCustomersPromise = response.data.map(async (basicCustomer) => {
        try {
          const detailResponse = await axios.get(`http://localhost:4000/api/customers/find?id=${basicCustomer.memberId}`);
          return detailResponse.data;
        } catch (error) {
          console.error(`Error fetching details for ${basicCustomer.name}:`, error);
          return basicCustomer; // Return basic info if detailed fetch fails
        }
      });
      
      const detailedCustomers = await Promise.all(detailedCustomersPromise);
      setCustomers(detailedCustomers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers. Please refresh the page.");
      setLoading(false);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEdit = (customer = null) => {
    setCurrentCustomer(customer);
    setShowModal(true);
  };

  const handleSave = async (customer) => {
    try {
      if (customer._id) {
        // Update existing customer
        const response = await axios.put(`http://localhost:4000/api/customers/${customer._id}`, customer);
        setCustomers((prev) =>
          prev.map((item) => (item._id === customer._id ? response.data : item))
        );
      } else {
        // Add new customer
        await axios.post("http://localhost:4000/api/customers", customer);
        
        // Refresh the customers list to get updated points for all customers
        // This ensures the referrer's points are updated in the UI
        await fetchCustomers();
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving customer:", error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  // Format date in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 bg-gray-100 flex-1 flex flex-col" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError("")} className="float-right">×</button>
          </div>
        )}
        
        {/* Search & Actions */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search Customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-200 px-4 py-2 w-60 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/customerinsights")}
              style={{ backgroundColor: '#4F7A94', fontFamily: 'Montserrat, sans-serif' }}
              className="text-white px-4 py-2 rounded-lg hover:opacity-80 transition duration-300"
            >
              Insights
            </button>
            <button
              onClick={() => handleAddEdit()}
              style={{ backgroundColor: '#4F7A94', fontFamily: 'Montserrat, sans-serif' }}
              className="text-white px-4 py-2 rounded-lg hover:opacity-80 transition duration-300"
            >
              Add Customer
            </button>
          </div>
        </div>

        {/* Customer Table with scrolling container - with reduced height */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="overflow-x-auto w-full h-full">
            <table className="min-w-full table-fixed">
              <thead className="bg-gray-200 sticky top-0" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <tr>
                  <th className="px-4 py-2 text-center w-1/6">Customer Name</th>
                  <th className="px-4 py-2 text-center w-1/6">Email</th>
                  <th className="px-4 py-2 text-center w-1/6">Phone Number</th>
                  <th className="px-4 py-2 text-center w-1/6">Date Created</th>
                  <th className="px-4 py-2 text-center w-1/6">Reward Points</th>
                  <th className="px-4 py-2 text-center w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="overflow-y-auto">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr 
                      key={customer._id || customer.memberId} 
                      className="border-t hover:bg-gray-50 cursor-pointer" 
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <td className="px-4 py-2 text-center">{customer.name || '—'}</td>
                      <td className="px-4 py-2 text-center">{customer.email || '—'}</td>
                      <td className="px-4 py-2 text-center">{customer.phone || '—'}</td>
                      <td className="px-4 py-2 text-center">{formatDate(customer.createdAt)}</td>
                      <td className="px-4 py-2 text-center">{customer.rewardPoints || 0}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Stop event propagation
                            handleAddEdit(customer);
                          }}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 mr-2"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                      {searchTerm ? "No customers found matching your search" : "No customers yet. Add your first customer!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <CustomerModal
            customer={currentCustomer}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
            customers={customers}
          />
        )}

        {/* Customer Details */}
        {selectedCustomer && (
          <CustomerDetails
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </div>
    </div>
  );
}

function CustomerModal({ customer, onClose, onSave, customers }) {
  const [name, setName] = useState(customer?.name || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [referralId, setReferralId] = useState(customer?.referralId || "");
  const [referralError, setReferralError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Verify referral ID both locally and with the server
  const verifyReferral = async (id) => {
    if (!id) {
      setReferralError("");
      setIsValid(true);
      return true;
    }
    
    setIsVerifying(true);
    
    // First check locally for quick feedback
    const localCheck = customers.some(cust => cust.memberId === id);
    
    if (localCheck) {
      setReferralError("");
      setIsValid(true);
      setIsVerifying(false);
      return true;
    } else {
      // Double check with server in case local list is not updated
      try {
        const response = await axios.get(`http://localhost:4000/api/customers/check/${id}`);
        const serverCheck = response.data.exists;
        
        if (serverCheck) {
          setReferralError("");
          setIsValid(true);
          setIsVerifying(false);
          return true;
        } else {
          setReferralError("Invalid referral ID. Enter a valid Member ID.");
          setIsValid(false);
          setIsVerifying(false);
          return false;
        }
      } catch (error) {
        console.error("Error checking referral:", error);
        setReferralError("Could not verify referral ID. Please try again.");
        setIsValid(false);
        setIsVerifying(false);
        return false;
      }
    }
  };

  // Check referral ID when it changes
  useEffect(() => {
    if (referralId) {
      const debounceTimeout = setTimeout(() => {
        verifyReferral(referralId);
      }, 500);
      
      return () => clearTimeout(debounceTimeout);
    }
  }, [referralId]);

  const handleSave = async () => {
    // Validate required fields
    if (!name || !email || !phone) {
      alert("Name, email and phone are required!");
      return;
    }
    
    // Validate email format
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    // Validate phone number (10 digits)
    if (!phone.match(/^\d{10}$/)) {
      alert("Phone number must be 10 digits");
      return;
    }

    // Final check of referral ID before saving
    if (referralId) {
      const isValid = await verifyReferral(referralId);
      if (!isValid) {
        alert("Please enter a valid referral ID or leave it empty");
        return;
      }
      
      // Prevent self-referral
      if (customer?.memberId === referralId) {
        alert("A customer cannot refer themselves");
        return;
      }
    }

    onSave({ 
      ...customer, 
      name, 
      email, 
      phone, 
      referralId: referralId || null 
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {customer ? "Edit" : "Add"} Customer
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name*</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Customer name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email*</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@example.com"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone Number* (10 digits)</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="1234567890"
            maxLength={10}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Referral ID (Optional)</label>
          <div className="relative">
            <input
              type="text"
              value={referralId}
              onChange={(e) => setReferralId(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                referralError ? 'border-red-500' : ''
              }`}
              placeholder="CUST-xxxxxxxx-xxx"
            />
            {isVerifying && (
              <span className="absolute right-3 top-2 text-blue-500 text-sm animate-pulse">
                Verifying...
              </span>
            )}
          </div>
          {referralError && <p className="text-red-500 text-sm mt-1">{referralError}</p>}
          {referralId && !referralError && !isVerifying && (
            <p className="text-green-500 text-sm mt-1">Valid referral ID</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enter Member ID of the customer who referred this person. The referrer will receive 10 bonus points.
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            disabled={isVerifying || (referralId && !isValid)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerDetails({ customer, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Customer Details
        </h3>
        
        <div className="mb-4 space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Name:</span>
            <span>{customer.name || '—'}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Email:</span>
            <span>{customer.email || '—'}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Phone:</span>
            <span>{customer.phone || '—'}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Member ID:</span>
            <span>{customer.memberId || '—'}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Customer Type:</span>
            <span>{customer.customerType || 'Fresh'}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Reward Points:</span>
            <span>{customer.rewardPoints || 0}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Referrals:</span>
            <span>{customer.referrals?.length || 0}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Total Spending:</span>
            <span>
              ₹{customer.purchaseHistory && customer.purchaseHistory.length > 0
                ? customer.purchaseHistory.reduce((total, purchase) => 
                    total + (purchase.totalAmount || 0), 0).toFixed(2)
                : '0.00'}
            </span>
          </div>
          
          {customer.referralId && (
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Referred By:</span>
              <span>{customer.referralId}</span>
            </div>
          )}
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Created:</span>
            <span>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerList;