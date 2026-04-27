import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BillingProvider } from "./context/BillingContext";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/Dashboard/Dashboard";
import Cashierdashboard from "./pages/Dashboard/CashierDashboard";
import SettingsPage from "./pages/SettingsPage";
import SalesPage from "./pages/SalesReport";
import Login from "./pages/Login";
import CustomerInsights from "./pages/CustomerInsights";
import InventoryPage from "./pages/Inventory";
import MembersPage from "./pages/Rewards";
import Billing from "./pages/Billing";
import BillingCashier from "./pages/BillingCashier";
import ProductTable from "./pages/Product";
import NotificationPage from "./pages/Notification";
import ProfilePage from "./pages/Profile";
import CustomerList from "./pages/CustomerList";
import Welcome from "./pages/Welcome";
import Rewardproduct from "./pages/Productreward";

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="App flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16 bg-gray-50">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  if (typeof window !== "undefined" && !localStorage.getItem("user")) {
    localStorage.setItem(
      "user",
      JSON.stringify({ role: "manager", name: "Admin", email: "admin@example.com" })
    );
  }

  return (
    <BillingProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  
                  {/* Cashier-only routes */}
                  <Route path="/CashierDashboard" element={
                    <ProtectedRoute allowedRoles={["cashier"]}>
                      <Cashierdashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/billingCashier" element={
                    <ProtectedRoute allowedRoles={["cashier"]}>
                      <BillingCashier />
                    </ProtectedRoute>
                  } />
                  
                  {/* Manager-only routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sales" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <SalesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <InventoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/product" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <ProductTable />
                    </ProtectedRoute>
                  } />
                  <Route path="/customerinsights" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <CustomerInsights />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <NotificationPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/rewardProduct" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <Rewardproduct />
                    </ProtectedRoute>
                  } />
                  
                  {/* Routes accessible by both roles */}
                  <Route path="/billing" element={
                    <ProtectedRoute allowedRoles={["manager", "cashier"]}>
                      <Billing />
                    </ProtectedRoute>
                  } />
                  <Route path="/customerlist" element={
                    <ProtectedRoute allowedRoles={["manager", "cashier"]}>
                      <CustomerList />
                    </ProtectedRoute>
                  } />
                  <Route path="/rewards" element={
                    <ProtectedRoute allowedRoles={["manager", "cashier"]}>
                      <MembersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={["manager", "cashier"]}>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  
                  <Route
                    path="*"
                    element={
                      <div className="text-center mt-10">
                        404 - Page Not Found
                      </div>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </BillingProvider>
  );
};

export default App;