const Users = require("../models/User");
const bcrypt = require("bcrypt");

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await Users.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await Users.create({
            username,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            message: "User created successfully!",
            data: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update user by ID
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;

    try {
        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        user.username = username || user.username;
        user.role = role || user.role;

        const updatedUser = await user.save();

        res.status(200).json({
            message: "User updated successfully!",
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        await user.deleteOne();

        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
