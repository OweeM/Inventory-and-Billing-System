import React, { useState, useEffect } from "react";
import AddUserModal from "../components/AddUserModal";
import ChangePasswordModal from "../components/ChangePassword";
import Navbar from "../components/Navbar";
import axios from "axios";

const SettingsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Add User Modal state
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false); // Change Password Modal state
    const [currentUser, setCurrentUser] = useState("");
    const [users, setUsers] = useState([]);
    const [visibleUsers, setVisibleUsers] = useState(3); // Number of users to show initially

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/auth/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleOpenChangePassword = (username) => {
        setCurrentUser(username);
        setIsChangePasswordOpen(true);
    };

    const handleShowMore = () => {
        setVisibleUsers((prevVisibleUsers) => prevVisibleUsers + 3);
    };

    // ToggleSwitch Component
    const ToggleSwitch = () => {
        return (
            <input
                type="checkbox"
                className="appearance-none w-12 h-6 rounded-full bg-gray-300 checked:bg-blue-600 relative before:absolute before:content-[''] before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:transform checked:before:translate-x-6"
            />
        );
    };

    // Users Section
    const Users = () => {
        return (
            <div className="mb-6">
                <h2 className="text-lg font-bold mb-2 font-[Montserrat]">Users</h2>
                <p className="text-sm mb-4 font-[Noto Sans]">Existing users</p>

                <div className="space-y-4">
                    {users.slice(0, visibleUsers).map((user, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow"
                        >
                            <div>
                                <p className="font-bold font-[Montserrat]">{user.username}</p>
                                <p className="text-sm text-gray-600 font-[Noto Sans]">
                                    Role: {user.role}
                                </p>
                                <button
                                    onClick={() => handleOpenChangePassword(user.username)}
                                    className="text-sm text-blue-500 hover:underline mt-1 font-[Noto Sans]"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show More Button */}
                {visibleUsers < users.length && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleShowMore}
                            style={{ borderRadius: "20px" }}
                            className="px-6 py-2 bg-[#4F7A94] text-white hover:bg-[#41697F] transition duration-300 font-[Montserrat]"
                        >
                            Show More
                        </button>
                    </div>
                )}

                {/* Add User Button */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ borderRadius: "20px" }}
                        className="px-6 py-2 bg-[#4F7A94] text-white hover:bg-[#41697F] transition duration-300 font-[Montserrat]"
                    >
                        Register New User
                    </button>
                </div>
            </div>
        );
    };

    // Reward Section
    const Rewards = () => {
        return (
            <div className="flex items-center justify-between bg-white p-4 rounded-md shadow">
                <div>
                    <h3 className="font-medium font-[Montserrat]">Rewards</h3>
                    <p className="text-sm text-gray-500 font-[Noto Sans]">
                        You can turn on/off reward services
                    </p>
                </div>
                <ToggleSwitch />
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="p-6 max-w-4xl mx-auto mt-2">
                <h1 className="text-2xl font-bold mb-6 font-[Montserrat] text-[#4F7A94]">
                    General Settings
                </h1>

                {/* Users Section */}
                <section className="mb-8">
                    <Users />
                </section>

                {/* Rewards Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-2 font-[Montserrat]">
                        Rewards Settings
                    </h2>
                    <Rewards />
                </section>

                {/* Modals */}
                <AddUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fetchUsers={fetchUsers} // Pass fetchUsers to refresh the user list after adding a new user
                />
                <ChangePasswordModal
                    isOpen={isChangePasswordOpen}
                    onClose={() => setIsChangePasswordOpen(false)}
                    username={currentUser}
                />
            </div>
        </div>
    );
};

export default SettingsPage;