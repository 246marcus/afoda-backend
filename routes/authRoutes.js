import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken } from "../utils/generateToken.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

// Register and Login
router.post("/register", register);
router.post("/login", login);

// Get current user from token in cookie
router.get("/me", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const user = verifyToken(token);

  if (!user) return res.status(403).json({ message: "Invalid token" });

  console.log(user);
  const user_ = await User.find({ _id: user.id });
  console.log(user_);
  res.status(200).json({ user: user_[0] });
});

// Logout user by clearing cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
