import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineProduct } from "react-icons/ai";
import {
  FiHome,
  FiSearch,
  FiBox,
  FiFileText,
  FiUsers,
  FiGift,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import { MdCardGiftcard } from "react-icons/md"; // Import react icon for Reward Products

const Sidebar = () => {
  const location = useLocation(); // Get the current route location
  const [userRole, setUserRole] = useState(null);

  // Get user role from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role) {
      setUserRole(user.role);
    }
  }, []);

  // Function to conditionally apply the active class based on the route
  const getActiveClass = (path) => {
    return location.pathname === path ? "text-blue-600" : "";
  };

  // Check if the menu item should be visible for the current user role
  const isMenuItemVisible = (allowedRoles) => {
    if (!allowedRoles) return true; // If no roles specified, show to everyone
    if (!userRole) return false; // If user role not loaded yet, don't show
    return allowedRoles.includes(userRole);
  };

  // Menu items with role permissions
  const menuItems = [
    {
      path: userRole === "cashier" ? "/CashierDashboard" : "/dashboard",
      icon: <FiHome className="mr-3 text-xl" />,
      name: "Dashboard",
      roles: ["manager", "cashier"]
    },
    {
      path: "/inventory",
      icon: <FiBox className="mr-3 text-xl" />,
      name: "Inventory",
      roles: ["manager"]
    },
    {
      path: "/product",
      icon: <AiOutlineProduct className="mr-3 text-2xl" />,
      name: "Product",
      roles: ["manager"]
    },
    {
      path: "/billing",
      icon: <FiFileText className="mr-3 text-xl" />,
      name: "Billing",
      roles: ["manager", "cashier"]
    },
    {
      path: "/customerlist",
      icon: <FiUsers className="mr-3 text-xl" />,
      name: "Customers",
      roles: ["manager", "cashier"]
    },
    {
      path: "/rewardProduct",
      icon: <MdCardGiftcard className="mr-3 text-xl" />,
      name: "Reward Products",
      roles: ["manager"]
    },
    {
      path: "/rewards",
      icon: <FiGift className="mr-3 text-xl" />,
      name: "Rewards",
      roles: ["manager", "cashier"]
    },
    {
      path: "/sales",
      icon: <FiBarChart2 className="mr-3 text-xl" />,
      name: "Reports",
      roles: ["manager"]
    },
    {
      path: "/settings",
      icon: <FiSettings className="mr-3 text-xl" />,
      name: "Settings",
      roles: ["manager"]
    }
  ];

  return (
    <div className="flex font-montserrat">
      {/* Sidebar */}
      <div className="bg-gray-100 shadow-lg h-[calc(100vh-64px)] w-64 fixed top-16">
        {/* Search Bar */}
        <div className="p-4 border-b flex items-center">
          <div className="relative w-full">
            {/* Search icon */}
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Navigation Links */}
        <div className="p-4">
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              isMenuItemVisible(item.roles) && (
                <li
                  key={index}
                  className={`flex items-center text-lg cursor-pointer rounded-md ${getActiveClass(
                    item.path
                  )}`}
                >
                  {item.icon}
                  <Link to={item.path}>{item.name}</Link>
                </li>
              )
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
