import { Request, Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

// Generate JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// Get cookie options for production
const getCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: true, // Always true for production HTTPS
    sameSite: "none", // Required for cross-origin cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain: ".afoda.store", // Your domain
    path: "/",
  };
};

// Register
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;

  try {
    console.log("🔐 Registration attempt for:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const token = generateToken(newUser._id.toString());
    const cookieOptions = getCookieOptions();

    console.log("🍪 Setting cookie with options:", cookieOptions);
    res.cookie("token", token, cookieOptions);

    const responseData = {
      message: "Registration successful",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    };

    console.log("✅ Registration successful for:", email);
    res.status(201).json(responseData);
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    console.log("🔐 Login attempt for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString());
    const cookieOptions = getCookieOptions();

    console.log("🍪 Setting cookie with options:", cookieOptions);
    res.cookie("token", token, cookieOptions);

    const responseData = {
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };

    console.log("✅ Login successful for:", email);
    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cookieOptions = getCookieOptions();

    console.log("🚪 Clearing cookie...");
    res.clearCookie("token", cookieOptions);

    console.log("✅ Logout successful");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile
export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("👤 Profile request for user ID:", req.userId);

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      console.log("❌ User not found in profile request:", req.userId);
      res.status(404).json({ message: "User not found" });
      return;
    }

    console.log("✅ Profile data sent for:", user.email);
    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
