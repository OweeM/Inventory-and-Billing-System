import React from "react";
import { FiHelpCircle, FiMail } from "react-icons/fi"; // Import icons

function Welcome() {
  const handleRedirect = (role) => {
    if (role === "manager") {
      window.location.href = "/manager";
    } else if (role === "cashier") {
      window.location.href = "/cashier";
    }
  };

  return (
    <div className="flex justify-between items-center h-screen bg-white text-black">
      {/* Left Section: Welcome Text */}
      <div className="w-full h-full flex flex-col justify-center items-center space-y-12 px-16">
        {/* Welcome Text */}
        <div className="text-center">
          <h1 className="text-5xl font-bold">Welcome</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Please select one of the below!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-6">
          <button
            onClick={() => handleRedirect("manager")}
            className="px-10 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:opacity-90 transition"
          >
            Admin
          </button>
          <button
            onClick={() => handleRedirect("cashier")}
            className="px-10 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:opacity-90 transition"
          >
            Cashier
          </button>
        </div>

        {/* Links */}
        <div className="flex space-x-6 mt-6">
          <a
            href="/help"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <FiHelpCircle className="text-lg" /> {/* Help Icon */}
            <span>Help</span>
          </a>
          <a
            href="/contact"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <FiMail className="text-lg" /> {/* Contact Icon */}
            <span>Contact</span>
          </a>
        </div>
      </div>

      {/* Right Section: Illustration */}
      <div className="w-full h-full flex justify-center items-center">
        <img
          src="/ecommerce_image.jpg" // Replace with actual image path
          alt="Ecommerce Illustration"
          className="w-3/4 rounded-lg"
        />
      </div>
    </div>
  );
}

export default Welcome;

