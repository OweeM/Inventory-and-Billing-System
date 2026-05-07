// import React from 'react';
// import { Navigate } from 'react-router-dom';

// /**
//  * ProtectedRoute component for role-based access control
//  * @param {Object} props - Component props
//  * @param {React.ReactNode} props.children - Child components to render if authorized
//  * @param {Array} props.allowedRoles - Array of roles allowed to access the route
//  * @returns {React.ReactNode} - Protected route component
//  */
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   // Get user data from localStorage
//   const userString = localStorage.getItem('user');
//   let user = null;
  
//   try {
//     user = JSON.parse(userString);
//   } catch (error) {
//     console.error('Error parsing user data:', error);
//   }
  
//   // If no user or not logged in, redirect to login
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
  
//   // If user role is not in allowed roles, redirect to appropriate dashboard
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return user.role === 'cashier' 
//       ? <Navigate to="/CashierDashboard" replace /> 
//       : <Navigate to="/dashboard" replace />;
//   }
  
//   // If user has appropriate role, render the protected content
//   return children;
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  let user = null;

  try {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Invalid user data in localStorage");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No role (corrupt data)
  if (!user.role) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === "cashier") {
      return <Navigate to="/CashierDashboard" replace />;
    } else if (user.role === "manager") {
      return <Navigate to="/dashboard" replace />;
    } else {
      // Unknown role
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }
  }

  // Authorized
  return children;
};

export default ProtectedRoute;