"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User")); // Remove IUser import
// Generate JWT (UNCHANGED)
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
// Register (FIXED)
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body; // Changed from 'name'
    try {
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        // REMOVED MANUAL HASHING - schema handles it
        const newUser = await User_1.default.create({
            firstName,
            lastName,
            email,
            password, // Pass plain password - pre-save hook will hash it
        });
        const token = generateToken(newUser._id.toString());
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: "Registration successful",
            user: {
                _id: newUser._id,
                firstName: newUser.firstName, // Now valid
                lastName: newUser.lastName, // Now valid
                email: newUser.email,
                role: newUser.role,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.registerUser = registerUser;
// Login (FIXED)
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = await user.comparePassword(password); // Use model method
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const token = generateToken(user._id.toString());
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                firstName: user.firstName, // Now valid
                lastName: user.lastName, // Now valid
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.loginUser = loginUser;
// Logout (UNCHANGED)
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.logoutUser = logoutUser;
// Get User Profile (FIXED)
const getUserProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            user: {
                _id: user._id,
                firstName: user.firstName, // Now valid
                lastName: user.lastName, // Now valid
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getUserProfile = getUserProfile;
