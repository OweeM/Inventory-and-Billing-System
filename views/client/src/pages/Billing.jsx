import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGift } from "react-icons/fa";
import { toast } from "react-toastify";

const Billing = () => {
  const navigate = useNavigate();

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    memberId: "",
    rewardPoints: 0,
  });

  const initialBillingItems = [
    {
      code: "",
      description: "",
      qty: 1,
      unitPrice: "",
      rewards: "",
      amount: 0,
    },
  ];

  const [billingItems, setBillingItems] = useState(initialBillingItems);
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [redeem, setRedeem] = useState(false);
  const [rewardProducts, setRewardProducts] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(false);

  // Fetch reward products
  useEffect(() => {
    const fetchRewardProducts = async () => {
      try {
        setLoadingRewards(true);
        const response = await fetch("http://localhost:4000/api/rewardproduct");
        const data = await response.json();
        if (response.ok) {
          setRewardProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching reward products:", error);
      } finally {
        setLoadingRewards(false);
      }
    };

    fetchRewardProducts();
  }, []);

  // Add reward product to billing items
  const addRewardProductToBill = (product) => {
    if (product.quantity <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }
    
    if (customerDetails.rewardPoints >= product.rewardPoints) {
      setBillingItems([
        ...billingItems,
        {
          code: product.rewardProductId,
          description: product.name,
          qty: 1,
          unitPrice: "0.00",
          rewards: product.rewardPoints,
          amount: "0.00",
        },
      ]);
    } else {
      toast.warning("Customer doesn't have enough reward points for this product");
    }
  };

  // Fetch customer details
  const fetchCustomerDetails = async (mobile) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/customers/search?mobile=${mobile}`
      );
      const data = await response.json();
      if (response.ok) {
        setCustomerDetails({
          name: data.name,
          email: data.email,
          memberId: data.memberId,
          rewardPoints: data.rewardPoints,
        });
      } else {
        setCustomerDetails({
          name: "",
          email: "",
          memberId: "",
          rewardPoints: 0,
        });
        setMobileError("Customer not found");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      setMobileError("Error fetching customer details");
    }
  };

  // Handle mobile number change
  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setMobileNumber(value);
      if (value.length === 10) {
        setMobileError("");
        fetchCustomerDetails(value);
      } else {
        setMobileError("Mobile number must be exactly 10 digits.");
      }
    }
  };

  // Handle billing changes
  const handleBillingChange = async (index, field, value) => {
    const updatedItems = [...billingItems];
    updatedItems[index][field] = value;

    if (field === "code" && value.trim() !== "") {
      try {
        // Check if it's a reward product (starts with "RP")
        if (value.startsWith("RP")) {
          const response = await fetch(
            `http://localhost:4000/api/rewardproduct/${value}`
          );
          if (response.ok) {
            const product = await response.json();
            
            // Check if product is out of stock
            if (product.quantity <= 0) {
              toast.error(`${product.name} is out of stock!`);
              updatedItems[index].description = "OUT OF STOCK";
              updatedItems[index].unitPrice = "0.00";
              updatedItems[index].amount = "0.00";
            } else {
              updatedItems[index].description = product.name;
              updatedItems[index].unitPrice = "0.00";
              updatedItems[index].amount = "0.00";
            }
          } else {
            updatedItems[index].description = "Reward Product Not Found";
            updatedItems[index].unitPrice = "";
            updatedItems[index].amount = "";
          }
        } else {
          const response = await fetch(
            `http://localhost:4000/api/products/${value}`
          );
          if (response.ok) {
            const product = await response.json();
            
            // Check if product is out of stock
            if (product.quantity <= 0) {
              toast.error(`${product.name} is out of stock!`);
              updatedItems[index].description = "OUT OF STOCK";
              updatedItems[index].unitPrice = "0.00";
              updatedItems[index].amount = "0.00";
            } else {
              updatedItems[index].description = product.description;
              updatedItems[index].unitPrice = product.price;
              updatedItems[index].amount = (
                updatedItems[index].qty * product.price
              ).toFixed(2);
            }
          } else {
            updatedItems[index].description = "Not Found";
            updatedItems[index].unitPrice = "";
            updatedItems[index].amount = "";
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    }

    setBillingItems(updatedItems);
    updateTotalPrice(updatedItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const updatedItems = [...billingItems];
    const qty = parseInt(value, 10) || 0;

    updatedItems[index].qty = qty;
    updatedItems[index].amount = (
      qty * (parseFloat(updatedItems[index].unitPrice) || 0)
    ).toFixed(2);

    setBillingItems(updatedItems);
    updateTotalPrice(updatedItems);
  };

  // Handle key down
  const handleKeyDown = (index, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setBillingItems([
        ...billingItems,
        {
          code: "",
          description: "",
          qty: 1,
          unitPrice: "",
          rewards: "",
          amount: 0,
        },
      ]);
    }
  };

  // Update total price
  const updateTotalPrice = (items) => {
    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    setTotalPrice(total.toFixed(2));
  };

  // Calculate discount and final total
  const discount = redeem ? customerDetails.rewardPoints * 20 : 0;
  const finalTotal =
    parseFloat(totalPrice) - discount > 0
      ? (parseFloat(totalPrice) - discount).toFixed(2)
      : "0.00";

  // Handle next button - THIS IS WHERE WE UPDATE QUANTITIES
  const handleNext = async () => {
    try {
      // Collect products to update (regular products)
      const regularProducts = billingItems
        .filter(item => !item.code.startsWith("RP") && item.code)
        .map(item => ({
          productId: item.code,
          quantitySold: item.qty
        }));
      
      // Collect reward products to update
      const rewardProducts = billingItems
        .filter(item => item.code.startsWith("RP"))
        .map(item => ({
          rewardProductId: item.code,
          quantitySold: item.qty
        }));

      // Update regular product quantities
      if (regularProducts.length > 0) {
        await fetch(
          "http://localhost:4000/api/products/update-stock",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: regularProducts }),
          }
        );
      }
      
      // Update reward product quantities
      if (rewardProducts.length > 0) {
        await fetch(
          "http://localhost:4000/api/rewardproduct/update-stock",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: rewardProducts }),
          }
        );
      }

      let totalRewardPointsUsed = 0;
      billingItems.forEach((item) => {
        if (item.code.startsWith("RP")) {
          totalRewardPointsUsed += parseInt(item.rewards || 0, 10);
        }
      });

      if (totalRewardPointsUsed > 0) {
        await fetch(`http://localhost:4000/api/customers/redeem`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: customerDetails.memberId,
            pointsRedeemed: totalRewardPointsUsed,
            discount: 0,
          }),
        });
      }

      // Redeem points for reward products if any
      if (redeem > 0) {
        await fetch(`http://localhost:4000/api/customers/redeem`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: customerDetails.memberId,
            pointsRedeemed: redeem,
            discount: 0, // No discount since we removed checkbox redemption
          }),
        });
      }

      await fetch("http://localhost:4000/api/customers/purchaseHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: customerDetails.memberId,
          items: billingItems.map((item) => ({
            productId: item.code,
            quantity: item.qty,
            price: parseFloat(item.unitPrice),
          })),
          totalAmount: parseFloat(totalPrice),
          rewardPointsEarned: Math.floor(parseFloat(finalTotal) / 10),
          date: new Date().toISOString(),
        }),
      });

      // Show success toast and redirect after 5-6 seconds
      toast.success("Transaction completed successfully!", {
        position: "top-right",
        autoClose: 7000, // 5.5 seconds
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
      });

      // Navigate after a delay (5.5 seconds)
      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            transactionCompleted: true,
            customerName: customerDetails.name,
            amount: totalPrice,
          },
        });
      }, 5500);

    } catch (error) {
      console.error("Error processing transaction:", error);
      toast.error("❌ Transaction failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Customer Details Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center border-b pb-4 mb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex-1">
                Customer Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Mobile No.
                </label>
                <input
                  type="text"
                  className={`w-32 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    mobileError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  maxLength="10"
                />
                {mobileError && (
                  <p className="text-red-500 text-sm mt-1">{mobileError}</p>
                )}
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <p className="text-gray-700 text-lg">
                  <span className="font-bold">Name:</span>{" "}
                  {customerDetails.name || "N/A"}
                </p>
                <p className="text-gray-700 text-lg">
                  <span className="font-bold">Email:</span>{" "}
                  {customerDetails.email || "N/A"}
                </p>
                <p className="text-gray-700 text-lg">
                  <span className="font-bold">Member ID:</span>{" "}
                  {customerDetails.memberId || "N/A"}
                </p>
                <p className="text-gray-700 text-lg">
                  <span className="font-bold">Reward Points:</span>{" "}
                  <span className="bg-yellow-200 px-2 py-1 rounded">
                    {customerDetails.rewardPoints}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Billing Table */}
          <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-8 overflow-x-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Billing Table
            </h3>
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#689cbe] text-white">
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit Price</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billingItems.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 transition duration-200"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={item.code}
                        onChange={(e) =>
                          handleBillingChange(index, "code", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                      />
                    </td>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={item.qty}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">{item.unitPrice}</td>
                    <td className="px-4 py-3">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reward Products Table */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 overflow-x-auto border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaGift className="mr-2 text-[#689cbe]" />
              Reward Products Catalog
            </h3>
            {loadingRewards ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#689cbe]"></div>
              </div>
            ) : rewardProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No reward products available
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#689cbe]">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        Product ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        Points
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rewardProducts.map((product) => (
                      <tr
                        key={product.rewardProductId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.rewardProductId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#689cbe]">
                          {product.rewardPoints} pts
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.quantity < 5
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => addRewardProductToBill(product)}
                            disabled={
                              customerDetails.rewardPoints <
                              product.rewardPoints
                            }
                            className={`px-3 py-1 rounded flex items-center ${
                              customerDetails.rewardPoints >=
                              product.rewardPoints
                                ? "bg-[#689cbe] text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            } transition`}
                          >
                            <FaGift className="mr-1" size={12} />
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Price Summary & Next Button */}
          <div className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-center">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-600">
                    Subtotal:
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    ₹{totalPrice}
                  </span>
                </div>
                {redeem && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-gray-600">
                        Discount:
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        -₹{discount}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-xl font-bold text-gray-700">
                        Final Total:
                      </span>
                      <span className="text-xl font-bold text-gray-700">
                        ₹{finalTotal}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              className="px-8 py-3 bg-[#689cbe] text-white font-semibold rounded-lg shadow-lg hover:bg-blue-800 transition duration-300"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;