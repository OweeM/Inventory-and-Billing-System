import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import
// import logo from "../image/";
// useNavigate hook

const Navbar = () => {
  const location = useLocation(); // Get the current location
  const navigate = useNavigate(); // Initialize navigation

  // Set the title based on the current route
  const getTitle = () => {
    if (location.pathname === "/sales") {
      return "Sales-Report"; // Title for the Sales page
    }
    if (location.pathname === "/settings") {
      return "Settings"; // Title for the settings page
    }
    if (location.pathname === "/dashboard") {
      return "Dashboard"; // Title for the Dashboard page
    }
    if (location.pathname === "/customerinsights") {
      return "Customer Insights"; // Title for the Customer Insights page
    }
    if (location.pathname === "/customerlist") {
      return "Customer List"; // Title for the Customer List page
    }
    if (location.pathname === "/inventory") {
      return "Inventory"; // Title for the Inventory page
    }
    if (location.pathname === "/product") {
      return "Product";
    }
    if (location.pathname === "/billing") {
      return "Billing";
    }
    if (location.pathname === "/rewards") {
      return "Rewards";
    }
    if (location.pathname === "/rewardProduct") {
      return "rewardProduct"; // New title for Reward Product page
    }
    // Default title
    return "Dashboard";
  };

  // Navigate to Notifications page
  const handleNotificationsClick = () => {
    navigate("/notifications"); // Redirect to /notifications route
  };

  // Navigate to Profile page
  const handleProfileClick = () => {
    navigate("/profile"); // Redirect to /profile route
  };

  // Handle logout
  const handleLogout = () => {
    // Clear user data from local storage or any other storage
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-[#F5F5F5] shadow z-50 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <img
          src="/image/logo.png"
          alt="Logo"
          className="h-24 w-auto object-contain" 
        />
        <span className="text-[#4F7A94] font-bold text-2xl font-[Montserrat] pl-16">
          {getTitle()}
        </span>
      </div>

      {/* Right-side Icons */}
      <div className="flex items-center space-x-6">
        <i
          className="fa-regular fa-bell text-[#4F7A94] text-lg cursor-pointer"
          onClick={handleNotificationsClick} // Add onClick to redirect
        ></i>
        <i
          className="fa-regular fa-user text-[#4F7A94] text-lg cursor-pointer"
          onClick={handleProfileClick} // Add onClick to redirect to profile
        ></i>
        <i
          className="fa-solid fa-arrow-right-from-bracket text-[#4F7A94] text-lg cursor-pointer"
          onClick={handleLogout} // Add onClick to handle logout
        ></i>
      </div>
    </nav>
  );
};

export default Navbar;