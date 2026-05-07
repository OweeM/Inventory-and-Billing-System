import axios from "axios";

const API_URL = "http://localhost:4000/api/auth"; // Correct API endpoint

// export const login = async (username, password) => {
//   try {
//       const response = await axios.post(`${API_URL}/login`, { username, password });
//       return response.data;
//   } catch (error) {
//       throw new Error(error.response?.data?.message || "Login failed");
//   }
// };
export const login = async (username, password) => {
  const res = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};
// export const register = async (username, password, role, firstName, lastName, bio) => {
//   try {
//       const response = await axios.post(`${API_URL}/register`, { username, password, role, firstName, lastName, bio });
//       return response.data;
//   } catch (error) {
//       throw new Error(error.response?.data?.message || "Registration failed");
//   }
// };

export const register = async (userData) => {
  const res = await fetch("http://localhost:4000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};