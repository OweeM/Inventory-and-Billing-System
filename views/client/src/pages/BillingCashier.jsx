import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BillingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Hook must be before any conditional return
  const [paymentMode, setPaymentMode] = useState("Cash");

  // ✅ Guard against direct access
  if (!location.state) {
    return (
      <div className="text-center text-red-600 font-semibold mt-10">
        ❌ Invalid access. Please complete billing first.
      </div>
    );
  }

  // ✅ Correct key: memberId (not memberID)
  const { customerDetails, mobileNumber, billingItems } = location.state;

  const productList = billingItems.map((item) => ({
    name: item.description,
    qty: item.qty,
    unitPrice: parseFloat(item.unitPrice) || 0,
    totalAmt: parseFloat(item.amount) || 0,
  }));

  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
  };

  const subtotal = productList.reduce((sum, item) => sum + item.totalAmt, 0);
  const gst = (subtotal * 5) / 100;
  const total = subtotal + gst;

  // Final submit function (show toast and handle history saving)
  const handleFinalSubmit = async () => {
    try {
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
          totalAmount: subtotal,
          rewardPointsEarned: Math.floor(total / 10),
          date: new Date().toISOString(),
        }),
      });

      toast.success("🎉 Thanks for shopping with us!", {
        position: "top-center",
        autoClose: 3000,
        onClose: () => navigate("/dashboard"), // Optionally close or redirect after success
      });
    } catch (error) {
      console.error("Error saving bill:", error);
      toast.error("❌ Failed to save bill.");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <main className="flex-1 p-8">
        <div className="bg-white p-6 rounded-md shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Bill Summary</h3>
            <p className="text-sm text-gray-500">INV2978</p>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm">
                <strong>Customer ID:</strong> {customerDetails.memberId}
              </p>
              <p className="text-sm">
                <strong>Reward Points:</strong>{" "}
                <span className="text-yellow-500">
                  {customerDetails.rewardPoints}
                </span>
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {customerDetails.email}
              </p>
            </div>
            <div>
              <p className="text-sm">
                <strong>Date:</strong>{" "}
                {new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm">
                <strong>Name:</strong> {customerDetails.name}
              </p>
              <p className="text-sm">
                <strong>Phone No.:</strong> {mobileNumber}
              </p>
            </div>
          </div>

          {/* Product List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">Product List</h3>
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Product Name</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Unit Price</th>
                  <th className="p-2">Total Amt</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.qty}</td>
                    <td className="p-2">{product.unitPrice}</td>
                    <td className="p-2">{product.totalAmt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end items-end mb-6">
            <div className="text-sm text-right">
              <p>
                <strong>SubTotal:</strong> {subtotal.toFixed(2)} rs.
              </p>
              <p>
                <strong>GST-5%:</strong> {gst.toFixed(2)} rs.
              </p>
              <p>
                <strong>Total:</strong> {total.toFixed(2)} rs.
              </p>
            </div>
          </div>

          {/* Attachment + Payment */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm font-bold">Attachment:</p>
              <a
                href="/invoices/INV2978_Bill.pdf"
                className="text-blue-500 underline text-sm"
                download="INV2978_Bill.pdf"
              >
                INV2978_Bill.pdf
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <h3 className="text-sm font-bold">Mode Of Payment:</h3>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMode"
                  value="Cash"
                  checked={paymentMode === "Cash"}
                  onChange={() => handlePaymentModeChange("Cash")}
                  className="mr-2"
                />
                Cash
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMode"
                  value="Online"
                  checked={paymentMode === "Online"}
                  onChange={() => handlePaymentModeChange("Online")}
                  className="mr-2"
                />
                Online
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
              onClick={() => navigate("/billing")}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleFinalSubmit}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillingPage;