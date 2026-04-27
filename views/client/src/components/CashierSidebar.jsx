import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiGift,
} from "react-icons/fi";

const CashierSidebar = () => {
  const location = useLocation();

  const getActiveClass = (path) => {
    return location.pathname === path
      ? "text-black font-bold"
      : "text-gray-500";
  };

  // Define the limited menu items for cashiers
  const cashierMenuItems = [
    {
      path: "/CashierDashboard",
      icon: <FiHome className="mr-2" />,
      name: "Dashboard"
    },
    {
      path: "/billing",
      icon: <FiFileText className="mr-2" />,
      name: "Billing"
    },
    {
      path: "/customerlist",
      icon: <FiUsers className="mr-2" />,
      name: "Customers"
    },
    {
      path: "/rewards",
      icon: <FiGift className="mr-2" />,
      name: "Rewards"
    }
  ];

  return (
    <div className="bg-gray-100 w-64 h-screen flex flex-col justify-between p-6">
      <div>
        <h2 className="text-lg font-bold mb-6">Main Menu</h2>
        <ul className="space-y-6">
          {cashierMenuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center space-x-2 ${getActiveClass(item.path)}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CashierSidebar;
