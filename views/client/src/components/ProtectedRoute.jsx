import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component for role-based access control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array} props.allowedRoles - Array of roles allowed to access the route
 * @returns {React.ReactNode} - Protected route component
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get user data from localStorage
  const userString = localStorage.getItem('user');
  let user = null;
  
  try {
    user = JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  
  // If no user or not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user role is not in allowed roles, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return user.role === 'cashier' 
      ? <Navigate to="/CashierDashboard" replace /> 
      : <Navigate to="/dashboard" replace />;
  }
  
  // If user has appropriate role, render the protected content
  return children;
};

export default ProtectedRoute;