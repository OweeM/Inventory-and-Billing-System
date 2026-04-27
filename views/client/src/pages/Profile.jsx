import React, { useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import ChangePasswordModal from "../components/ChangePassword";

const ProfilePage = () => {
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [user, setUser] = useState({
        username: "",
        name: "",
        role: "",
        firstName: "",
        lastName: "",
        bio: "",
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser({
                username: storedUser.username,
                name: `${storedUser.firstName} ${storedUser.lastName}`,
                role: storedUser.role,
                firstName: storedUser.firstName,
                lastName: storedUser.lastName,
                bio: storedUser.bio,
            });
        }
    }, []);

    const handlePasswordChange = () => {
        setIsEditingPassword(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                </div>

                {/* Profile Section */}
                <div className="flex items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-sm text-gray-600">{user.role}</p>
                    </div>
                    <button className="ml-auto flex items-center text-blue-500 hover:text-blue-600">
                        Edit <FiEdit2 className="ml-2" />
                    </button>
                </div>

                {/* Personal Information Section */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                        <button className="flex items-center text-blue-500 hover:text-blue-600">
                            Edit <FiEdit2 className="ml-2" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">First Name</span>
                            <p className="text-gray-800 font-medium">{user.firstName}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Last Name</span>
                            <p className="text-gray-800 font-medium">{user.lastName}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Bio</span>
                            <p className="text-gray-800 font-medium">{user.bio}</p>
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                {isEditingPassword ? (
                    <ChangePasswordModal
                        isOpen={isEditingPassword}
                        onClose={() => setIsEditingPassword(false)}
                        username={user.username}
                    />
                ) : (
                    <div className="border-t pt-4 mt-6">
                        <button
                            onClick={handlePasswordChange}
                            className="bg-[#4F7A94] text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring"
                        >
                            Change Password
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;