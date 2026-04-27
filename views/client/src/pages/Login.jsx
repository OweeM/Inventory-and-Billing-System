import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../Services/authService";
import loginImage from "../../src/img/your-image.png"
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userData = await login(username, password);
      console.log("User Data:", userData); // Debugging

      if (!userData || !userData.user || !userData.user.role) {
        setError("Invalid credentials, please try again.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(userData.user));
      console.log("User Role:", userData.user.role); // Debugging

      if (userData.user.role === "manager") {
        navigate("/dashboard");
      } else if (userData.user.role === "cashier") {
        navigate("/CashierDashboard");
      }
    } catch (error) {
      console.error("Login Error:", error); // Debugging
      setError("Invalid credentials, please try again.");
    }
  };

  return (

    <div className="flex justify-center items-center h-screen bg-white text-black">
      <div className="absolute top-2 left-4">
        <img
          src="/image/logo.png"
          alt="Logo"
          className="h-36 w-auto object-contain"
        />
      </div>
      <div className="mr-auto w-96 ml-72 mt-[-50px]">
        <h2 className="font-semibold text-4xl py-5 text-center">Login</h2>
        <div className="flex flex-col space-y-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex justify-center items-center">
            <button
              onClick={handleLogin}
              className="text-white px-6 py-2 rounded-3xl hover:opacity-90 transition duration-300 w-56 flex justify-center items-center"
              style={{ backgroundColor: "#404E68" }}
            >
              Login
            </button>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      </div>
      {/* Image container */}
      <div className="w-1/2 h-screen hidden md:block">
        <img
          src={loginImage}
          alt="Login"
          className="object-cover w-3/4 h-3.4 pt-24 ml-24"
        />
      </div>
    </div>
  );
}

export default Login;
