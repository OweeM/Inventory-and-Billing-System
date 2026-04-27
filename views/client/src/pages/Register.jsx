import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../Services/authService";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("cashier");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const userData = await register(username, password, role, firstName, lastName, bio);
            localStorage.setItem("user", JSON.stringify(userData.user));
            navigate("/profile");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-white text-black">
            <div className="mr-auto w-96 ml-72 mt-[-50px]">
                <h2 className="font-semibold text-4xl py-5 text-center">Register</h2>
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
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                    </select>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <textarea
                        placeholder="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex justify-center items-center">
                        <button
                            onClick={handleRegister}
                            className="text-white px-6 py-2 rounded-3xl hover:opacity-90 transition duration-300 w-56 flex justify-center items-center"
                            style={{ backgroundColor: "#404E68" }}
                        >
                            Register
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default Register;