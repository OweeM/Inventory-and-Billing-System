import React, { useState } from "react";
import { register } from "../Services/authService";

const AddUserModal = ({ isOpen, onClose, fetchUsers }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("cashier");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null; // Don't render anything if the modal is closed

    const handleRegister = async () => {
        try {
            await register(username, password, role, firstName, lastName, bio);
            fetchUsers(); // Refresh the user list after adding a new user
            onClose(); // Close the modal
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                    &times;
                </button>
                <h2 className="text-xl font-bold mb-4 text-center font-[Montserrat]">
                    Register New User
                </h2>
                <form className="space-y-4">
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                        />
                    </div>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                        />
                    </div>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                        >
                            <option value="cashier">Cashier</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                        />
                    </div>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                        />
                    </div>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            Bio
                        </label>
                        <textarea
                            placeholder="Bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                        />
                    </div>
                    <div className="text-center mt-6">
                        <button
                            type="button"
                            onClick={handleRegister}
                            className="bg-[#4F7A94] text-white px-6 py-2 rounded-full hover:bg-[#41697F] font-[Montserrat] transition duration-300"
                        >
                            Save
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;