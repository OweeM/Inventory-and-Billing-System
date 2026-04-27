import React, { useState } from "react";
import axios from "axios";

const ChangePasswordModal = ({ isOpen, onClose, username }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!isOpen) return null; // Don't render anything if the modal is closed

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.put("http://localhost:4000/api/auth/change-password", { username, newPassword });
            setSuccess("Password changed successfully!");
            setError("");
            setTimeout(() => {
                onClose();
                setSuccess("");
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Password change failed");
            setSuccess("");
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
                    Change Password
                </h2>
                <form className="space-y-4" onSubmit={handleChangePassword}>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            readOnly
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                        />
                    </div>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label
                            style={{ color: "#4F7A94" }}
                            className="block text-sm font-bold font-[Montserrat]"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none font-[Noto Sans]"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <div className="text-center mt-6">
                        <button
                            type="submit"
                            className="bg-[#4F7A94] text-white px-6 py-2 rounded-full hover:bg-[#41697F] font-[Montserrat] transition duration-300"
                        >
                            Save
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;